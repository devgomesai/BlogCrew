"""Agent Tools.
"""

from pathlib import Path
import httpx
from langchain_core.tools import InjectedToolArg, tool
from markdownify import markdownify
from tavily import TavilyClient
from typing_extensions import Annotated, Literal
from dotenv import load_dotenv

load_dotenv()
tavily_client = TavilyClient()

BASE_DIR = Path(__file__).parent

# BLOG_DIR: where blogs will be saved
BLOG_DIR = BASE_DIR.parent / "Blog"

# SKILLS_DIR: where agent skills are stored
SKILLS_DIR = BASE_DIR.parent / "skills"


def fetch_webpage_content(url: str, timeout: float = 10.0) -> str:
    """Fetch and convert webpage content to markdown.

    Args:
        url: URL to fetch
        timeout: Request timeout in seconds

    Returns:
        Webpage content as markdown
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = httpx.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return markdownify(response.text)
    except Exception as e:
        return f"Error fetching content from {url}: {str(e)}"


@tool(parse_docstring=True)
def web_search(
    query: str,
    max_results: Annotated[int, InjectedToolArg] = 1,
    topic: Annotated[
        Literal["general", "news", "finance"], InjectedToolArg
    ] = "general",
) -> str:
    """Search the web for information on a given query.

    Uses Tavily to discover relevant URLs, then fetches and returns full webpage content as markdown.

    Args:
        query: Search query to execute
        max_results: Maximum number of results to return (default: 1)
        topic: Topic filter - 'general', 'news', or 'finance' (default: 'general')

    Returns:
        Formatted search results with full webpage content
    """
    search_results = tavily_client.search(
        query,
        max_results=max_results,
        topic=topic,
    )

    result_texts = []
    for result in search_results.get("results", []):
        url = result["url"]
        title = result["title"]

        content = fetch_webpage_content(url)

        result_text = f"""## {title}
**URL:** {url}

{content}

---
"""
        result_texts.append(result_text)

    response = f"""Found {len(result_texts)} result(s) for '{query}':

{chr(10).join(result_texts)}"""

    return response


@tool(parse_docstring=True)
def write_blog(slug: str, content: str) -> str:
    """
    Save a blog to Blog/<slug>/Blog.md

    Args:
        slug: Subfolder name for the blog
        content: Blog content in markdown/text

    Returns:
        Confirmation message with saved path
    """
    path = BLOG_DIR / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)  # Ensure folder exists
    path.write_text(content, encoding="utf-8")
    return f"Blog saved to {path}"


@tool(parse_docstring=True)
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
        from google import genai

        client = genai.Client()
        res = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt],
        )

        for part in res.parts:
            if part.inline_data:
                path = BLOG_DIR / slug / f"{name}.png"
                path.parent.mkdir(parents=True, exist_ok=True)
                part.as_image().save(str(path))
                return f"Cover saved to {path}"
        return "No image was generated"
    except Exception as e:
        return f"Error generating cover: {e}"
