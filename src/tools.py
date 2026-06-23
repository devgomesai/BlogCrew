"""Agent Tools.

Reliability: retry (tenacity), caching (diskcache), and timeouts on all external calls.
"""

import re
from pathlib import Path
from functools import lru_cache

import httpx
import diskcache
from langchain_core.tools import InjectedToolArg, tool
from markdownify import markdownify
from tavily import TavilyClient
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing_extensions import Annotated, Literal
from dotenv import load_dotenv

load_dotenv()

tavily_client = TavilyClient()

BASE_DIR = Path(__file__).parent
BLOG_DIR = BASE_DIR.parent / "Blog"
CACHE_DIR = BASE_DIR.parent / ".cache"

# Persistent disk cache with size limit (256 MB)
_web_cache = diskcache.Cache(str(CACHE_DIR / "web"), size_limit=2**28)

SLUG_RE = re.compile(r"^[a-zA-Z0-9_-]+$")

_HTTPX_TIMEOUT = 30.0

# Cap fetched page content to keep research notes (and downstream LLM input)
# small. Full pages are often 20k+ tokens; the first few thousand chars carry
# the substance we need (stats, quotes, named examples).
_MAX_PAGE_CHARS = 6000

# Collapse 3+ consecutive blank lines (markdownify leaves many) into one.
_BLANK_LINES_RE = re.compile(r"\n\s*\n\s*\n+")


def _compact_markdown(text: str) -> str:
    """Trim whitespace bloat and cap length to control token usage."""
    text = _BLANK_LINES_RE.sub("\n\n", text).strip()
    if len(text) > _MAX_PAGE_CHARS:
        text = text[:_MAX_PAGE_CHARS].rstrip() + "\n\n[...truncated...]"
    return text


def _is_retryable_httpx(exc: Exception) -> bool:
    """True for network errors and 5xx HTTP errors, False for 4xx."""
    if isinstance(exc, (httpx.ConnectError, httpx.TimeoutException, httpx.RemoteProtocolError)):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code >= 500
    return False


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.InvalidURL)),
    reraise=True,
)
def fetch_webpage_content(url: str, timeout: float = _HTTPX_TIMEOUT) -> str:
    """Fetch and convert webpage content to markdown.

    Results are cached by URL so repeated fetches of the same page reuse
    the cached markdown rather than making a new HTTP request.

    Args:
        url: URL to fetch
        timeout: Request timeout in seconds

    Returns:
        Webpage content as markdown, or error message string on failure
    """
    cached = _web_cache.get(url)
    if cached is not None:
        return cached

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/91.0.4472.124 Safari/537.36"
        )
    }

    try:
        response = httpx.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        converted = _compact_markdown(markdownify(response.text))
        _web_cache.set(url, converted, expire=86400)  # cache for 24 hours
        return converted
    except httpx.HTTPStatusError as e:
        if e.response.status_code < 500:
            return f"Error {e.response.status_code} fetching {url}"
        raise
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        return f"Network error fetching {url}: {e}"


@tool(parse_docstring=True)
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True,
)
def web_search(
    query: str,
    max_results: Annotated[int, InjectedToolArg] = 1,
    topic: Annotated[
        Literal["general", "news", "finance"], InjectedToolArg
    ] = "general",
) -> str:
    """Search the web for information on a given query.

    Uses Tavily to discover relevant URLs, then fetches full webpage content as markdown.
    Results are cached so repeated queries reuse prior results.

    Args:
        query: Search query to execute
        max_results: Maximum number of results to return (default: 1)
        topic: Topic filter - 'general', 'news', or 'finance' (default: 'general')

    Returns:
        Formatted search results with full webpage content
    """
    cache_key = f"search:{query}:{max_results}:{topic}"
    cached = _web_cache.get(cache_key)
    if cached is not None:
        return cached

    search_results = tavily_client.search(
        query,
        max_results=max_results,
        topic=topic,
    )

    result_texts = []
    for result in search_results.get("results", []):
        url = result["url"]
        title = result["title"]

        # Tavily's own `content` is a relevance-ranked snippet — use it as the
        # lead. The full (capped) page follows for additional detail.
        snippet = (result.get("content") or "").strip()
        content = fetch_webpage_content(url)

        result_text = f"""## {title}
**URL:** {url}
**Summary:** {snippet}

{content}
---
"""
        result_texts.append(result_text)

    response = f"""Found {len(result_texts)} result(s) for '{query}':

{chr(10).join(result_texts)}"""

    _web_cache.set(cache_key, response, expire=86400)
    return response


@tool(parse_docstring=True)
def write_blog(slug: str, content: str) -> str:
    """
    Save a blog to Blog/<slug>/Blog.md

    Args:
        slug: Subfolder name for the blog (alphanumeric, hyphens, underscores only)
        content: Blog content in markdown/text

    Returns:
        Confirmation message with saved path
    """
    if not SLUG_RE.match(slug):
        return (
            f"Invalid slug '{slug}'. Use only letters, numbers, hyphens, and underscores."
        )
    path = BLOG_DIR / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"Blog saved to {path}"


def _generate_cover_gemini(prompt: str, slug: str, name: str) -> str:
    """Inner implementation — extracted so tenacity can retry it cleanly."""
    import io
    import PIL.Image
    from google import genai
    from google.genai import types

    client = genai.Client()
    res = client.models.generate_content(
        model="gemini-3.1-flash-image",
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        ),
    )

    for part in res.candidates[0].content.parts:
        if part.inline_data:
            path = BLOG_DIR / slug / f"{name}.png"
            path.parent.mkdir(parents=True, exist_ok=True)
            image = PIL.Image.open(io.BytesIO(part.inline_data.data))
            image.save(str(path))
            return f"Cover saved to {path}"
    return "No image was generated"


@tool(parse_docstring=True)
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type(Exception),
    reraise=False,
)
def generate_cover(prompt: str, slug: str, name: str) -> str:
    """
    Generate and save a cover image to Blog/<slug>/<name>.png using Gemini image model

    Args:
        prompt: Text prompt describing the image
        slug: Blog subfolder
        name: Image file name

    Returns:
        Status message with saved path or error
    """
    try:
        return _generate_cover_gemini(prompt, slug, name)
    except Exception as e:
        return f"Error generating cover: {e}"
