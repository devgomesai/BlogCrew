"""Agent Tools.

Reliability: retry (tenacity), caching (diskcache), and timeouts on all external calls.
"""

import base64
import hashlib
import io
import os
import re
from pathlib import Path
from typing import Annotated, Literal
from urllib.parse import quote

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
# Providers (chosen with IMAGE_PROVIDER):
#   pollinations— gen.pollinations.ai with FLUX.1.1-pro (default).
#                 Needs POLLONATION_API_KEY.
#   cloudflare  — Workers AI FLUX.1 [schnell], free tier, no watermark.
#                 Needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN.
#   gemini      — Gemini image model. Needs GOOGLE_API_KEY + billing.
#
# Cover dimensions match the existing posts in Blog/.
# ---------------------------------------------------------------------------

_COVER_SIZE = (1408, 768)
# FLUX.1.1-pro generation can take a while; 180s keeps slow queues from
# tripping the client timeout before the server answers.
_IMAGE_TIMEOUT = 180.0

_POLLINATIONS_MODEL = "black-forest-labs/flux.1.1-pro"

_CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"
# FLUX.1 [schnell] maxes out at 8 steps; 4 is the documented default and is
# what the free daily allowance is sized against.
_CF_STEPS = 4


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


def _image_provider() -> str:
    """Provider name from the environment, read per call so .env edits apply."""
    return os.environ.get("IMAGE_PROVIDER", "pollinations").strip().lower()


def _cover_seed(slug: str, name: str, prompt: str) -> int:
    """Stable seed so re-running the same post reproduces the same cover."""
    digest = hashlib.sha256(f"{slug}:{name}:{prompt}".encode()).hexdigest()
    return int(digest[:8], 16) % 2_147_483_647


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
def _generate_cover_cloudflare(prompt: str, slug: str, name: str) -> str:
    """Cloudflare Workers AI FLUX.1 [schnell] — free tier, no watermark."""
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not account or not token:
        raise _ProviderError(
            "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set "
            "for IMAGE_PROVIDER=cloudflare"
        )

    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{_CF_MODEL}"
    payload = {
        # The model accepts at most 2048 characters; long agent prompts are
        # truncated rather than rejected.
        "prompt": prompt[:2048],
        "steps": _CF_STEPS,
        "seed": _cover_seed(slug, name, prompt),
    }

    with httpx.Client(timeout=_IMAGE_TIMEOUT) as client:
        res = client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )

    if res.status_code == 429:
        raise _ProviderBusy(f"Cloudflare rate limited the request: {res.text[:200]}")
    if 400 <= res.status_code < 500:
        # Credential or prompt problems: retrying changes nothing.
        raise _ProviderError(
            f"Cloudflare returned {res.status_code}: {res.text[:300]}"
        )
    res.raise_for_status()

    if res.headers.get("content-type", "").startswith("image/"):
        return _save_cover(res.content, slug, name)

    body = res.json()
    if not body.get("success", False):
        raise _ProviderError(f"Cloudflare error: {body.get('errors')}")
    return _save_cover(base64.b64decode(body["result"]["image"]), slug, name)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=4, max=60),
    retry=retry_if_exception_type(_RETRYABLE_IMAGE_ERRORS),
    reraise=True,
)
def _generate_cover_pollinations(prompt: str, slug: str, name: str) -> str:
    """Pollinations gen API with FLUX.1.1-pro — needs POLLONATION_API_KEY."""
    api_key = os.environ.get("POLLONATION_API_KEY", "").strip()
    if not api_key:
        raise _ProviderError(
            "POLLONATION_API_KEY must be set for IMAGE_PROVIDER=pollinations"
        )

    url = "https://gen.pollinations.ai/image/" + quote(prompt[:1500], safe="")
    with httpx.Client(follow_redirects=True, timeout=_IMAGE_TIMEOUT) as client:
        res = client.get(
            url,
            params={"model": _POLLINATIONS_MODEL},
            headers={"Authorization": f"Bearer {api_key}"},
        )

    if res.status_code == 429:
        raise _ProviderBusy(f"Pollinations rate limited the request: {res.text[:200]}")
    if res.status_code in (401, 403):
        # Bad or exhausted key: retrying cannot fix it.
        raise _ProviderError(
            f"Pollinations rejected the API key ({res.status_code}): {res.text[:200]}"
        )
    if 400 <= res.status_code < 500:
        raise _ProviderError(
            f"Pollinations returned {res.status_code}: {res.text[:200]}"
        )
    res.raise_for_status()
    return _save_cover(res.content, slug, name)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=30),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
def _generate_cover_gemini(prompt: str, slug: str, name: str) -> str:
    """Gemini image model — needs GOOGLE_API_KEY and billing enabled."""
    from google import genai
    from google.genai import types

    client = genai.Client()
    res = client.models.generate_content(
        model="gemini-3.1-flash-lite-image",
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        ),
    )

    for part in res.candidates[0].content.parts:
        if part.inline_data:
            return _save_cover(part.inline_data.data, slug, name)
    return "No image was generated"


_COVER_PROVIDERS = {
    "cloudflare": _generate_cover_cloudflare,
    "pollinations": _generate_cover_pollinations,
    "gemini": _generate_cover_gemini,
}


def _cloudflare_configured() -> bool:
    """True when both Cloudflare values needed for Workers AI are present."""
    return bool(
        os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
        and os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    )


def _pollinations_configured() -> bool:
    """True when the gen API key needed for the Pollinations provider is set."""
    return bool(os.environ.get("POLLONATION_API_KEY", "").strip())


@tool(parse_docstring=True)
def generate_cover(prompt: str, slug: str, name: str) -> str:
    """
    Generate and save a 1408x768 cover image to Blog/<slug>/<name>.png

    Provider is set by IMAGE_PROVIDER (pollinations, cloudflare, or gemini).
    Pollinations (gen API, FLUX.1.1-pro) is the default and needs
    POLLONATION_API_KEY in .env.

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

    provider = _image_provider()
    impl = _COVER_PROVIDERS.get(provider)
    if impl is None:
        return (
            f"Unknown IMAGE_PROVIDER '{provider}'. "
            f"Use one of: {', '.join(sorted(_COVER_PROVIDERS))}."
        )

    # If Cloudflare was picked without credentials, fall back to the
    # Pollinations gen API instead of breaking the run.
    if provider == "cloudflare" and not _cloudflare_configured():
        if not _pollinations_configured():
            return (
                "Error generating cover: no usable image provider. Set "
                "POLLONATION_API_KEY (pollinations) or CLOUDFLARE_ACCOUNT_ID "
                "and CLOUDFLARE_API_TOKEN (cloudflare) in .env."
            )
        try:
            result = _generate_cover_pollinations(prompt, slug, name)
            return (
                f"{result} (fallback: Pollinations. Set CLOUDFLARE_ACCOUNT_ID "
                "and CLOUDFLARE_API_TOKEN for watermark-free covers.)"
            )
        except Exception as e:
            return f"Error generating cover: {e}"

    try:
        return impl(prompt, slug, name)
    except Exception as e:
        return f"Error generating cover: {e}"
