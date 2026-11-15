"""Agent Tools.

Reliability: retry (tenacity), caching (diskcache), and timeouts on all external calls.
"""

import base64
import io
import os
import re
from pathlib import Path
from typing import Annotated, Literal

import diskcache
import httpx
from dotenv import load_dotenv
from langchain_core.tools import InjectedToolArg, tool
from markdownify import markdownify
from tavily import TavilyClient
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

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


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((
        httpx.ConnectError,
        httpx.TimeoutException,
        httpx.RemoteProtocolError,
    )),
    retry_error_callback=lambda rs: (
        f"Failed to fetch URL after {rs.attempt_number} attempts: "
        f"{rs.outcome.exception()}"
    ),
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
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        with httpx.Client(follow_redirects=True, timeout=timeout) as client:
            response = client.get(url, headers=headers)

            if 400 <= response.status_code < 500:
                if response.status_code == 429:
                    return f"Rate limited (429) fetching {url}"
                return f"Client error {response.status_code} fetching {url}"

            if response.status_code >= 500:
                response.raise_for_status()

            response.raise_for_status()

            converted = _compact_markdown(markdownify(response.text))
            _web_cache.set(url, converted, expire=86400)
            return converted

    except httpx.HTTPStatusError as e:
        return f"Server error {e.response.status_code} fetching {url}"
    except (httpx.ConnectError, httpx.TimeoutException, httpx.RemoteProtocolError):
        raise
    except httpx.HTTPError as e:
        return f"HTTP error fetching {url}: {e}"


@tool(parse_docstring=True)
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=3, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True,
)
def web_search(
    query: str,
    max_results: Annotated[int, InjectedToolArg] = 3,
    topic: Annotated[
        Literal["general", "news", "finance"], InjectedToolArg
    ] = "general",
) -> str:
    """Search the web for information on a given query.

    Uses Tavily to discover relevant URLs, then fetches page content as markdown.
    Results are cached so repeated queries reuse prior results.

    Args:
        query: Search query to execute
        max_results: Maximum number of results to return (default: 3)
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
            f"Invalid slug '{slug}'. Use only letters, numbers, "
            "hyphens, and underscores."
        )
    path = BLOG_DIR / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"Blog saved to {path}"


# ---------------------------------------------------------------------------
# Cover images
#
# Provider: OpenRouter Images API (https://openrouter.ai/api/v1/images) with
# Recraft V4.1 Flash. Needs OPENROUTER_API_KEY in .env.
#
# Cover dimensions match the existing posts in Blog/.
# ---------------------------------------------------------------------------

_COVER_SIZE = (1408, 768)
# Image generation can take a while; 180s keeps slow queues from tripping the
# client timeout before the server answers.
_IMAGE_TIMEOUT = 180.0

_OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images"
_OPENROUTER_IMAGE_MODEL = "recraft/recraft-v4.1-flash-v2:free"


class _ProviderError(Exception):
    """Non-retryable provider failure (missing or bad credentials, bad prompt)."""


class _ProviderBusy(Exception):
    """Provider throttled us; worth retrying after a wait."""


_RETRYABLE_IMAGE_ERRORS = (
    httpx.ConnectError,
    httpx.TimeoutException,
    httpx.RemoteProtocolError,
    _ProviderBusy,
)


def _fit_cover(image):
    """Center-crop to the cover aspect ratio, then resize to the cover size."""
    import PIL.Image

    target_w, target_h = _COVER_SIZE
    target_ratio = target_w / target_h
    width, height = image.size

    if width / height > target_ratio:
        crop_w = int(round(height * target_ratio))
        left = (width - crop_w) // 2
        image = image.crop((left, 0, left + crop_w, height))
    else:
        crop_h = int(round(width / target_ratio))
        top = (height - crop_h) // 2
        image = image.crop((0, top, width, top + crop_h))

    return image.resize(_COVER_SIZE, PIL.Image.Resampling.LANCZOS)


def _save_cover(image_bytes: bytes, slug: str, name: str) -> str:
    """Write the image as PNG and verify it is readable before reporting success."""
    import PIL.Image

    if not image_bytes:
        raise _ProviderError("Provider returned an empty image body")

    with PIL.Image.open(io.BytesIO(image_bytes)) as image:
        fitted = _fit_cover(image.convert("RGB"))

    path = BLOG_DIR / slug / f"{name}.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    fitted.save(str(path), format="PNG", optimize=True)

    # AGENTS.md requires the saved file to be verified, not assumed.
    if path.stat().st_size == 0:
        raise _ProviderError(f"Saved cover is empty: {path}")
    with PIL.Image.open(str(path)) as check:
        check.verify()

    return f"Cover saved to {path}"


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=4, max=60),
    retry=retry_if_exception_type(_RETRYABLE_IMAGE_ERRORS),
    reraise=True,
)
def _generate_cover_openrouter(prompt: str, slug: str, name: str) -> str:
    """OpenRouter Images API with Recraft V4.1 Flash — needs OPENROUTER_API_KEY."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise _ProviderError(
            "OPENROUTER_API_KEY must be set for image generation"
        )

    payload = {
        "model": _OPENROUTER_IMAGE_MODEL,
        # Long agent prompts are truncated rather than rejected.
        "prompt": prompt[:1500],
    }

    with httpx.Client(timeout=_IMAGE_TIMEOUT) as client:
        res = client.post(
            _OPENROUTER_IMAGE_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

    if res.status_code == 429:
        raise _ProviderBusy(f"OpenRouter rate limited the request: {res.text[:200]}")
    if res.status_code in (401, 403):
        # Bad or exhausted key: retrying cannot fix it.
        raise _ProviderError(
            f"OpenRouter rejected the API key ({res.status_code}): {res.text[:200]}"
        )
    if 400 <= res.status_code < 500:
        raise _ProviderError(
            f"OpenRouter returned {res.status_code}: {res.text[:300]}"
        )
    res.raise_for_status()

    body = res.json()
    data = body.get("data") or []
    if not data or not data[0].get("b64_json"):
        raise _ProviderError(f"OpenRouter returned no image: {str(body)[:300]}")
    return _save_cover(base64.b64decode(data[0]["b64_json"]), slug, name)


@tool(parse_docstring=True)
def generate_cover(prompt: str, slug: str, name: str) -> str:
    """
    Generate and save a 1408x768 cover image to Blog/<slug>/<name>.png

    Uses the OpenRouter Images API (Recraft V4.1 Flash) and needs
    OPENROUTER_API_KEY in .env.

    Args:
        prompt: Text prompt describing the image
        slug: Blog subfolder (alphanumeric, hyphens, underscores only)
        name: Image file name

    Returns:
        Status message with saved path or error
    """
    if not SLUG_RE.match(slug) or not SLUG_RE.match(name):
        return (
            f"Invalid slug '{slug}' or name '{name}'. "
            "Use only letters, numbers, hyphens, and underscores."
        )

    try:
        return _generate_cover_openrouter(prompt, slug, name)
    except Exception as e:
        return f"Error generating cover: {e}"
