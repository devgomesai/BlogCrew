#!/usr/bin/env python3

from pathlib import Path
import yaml
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from src.tools import web_search

load_dotenv()
# Root directory
BASE_DIR = Path(__file__).parent


@tool
def write_blog(slug: str, content: str) -> str:
    """Save blog to Blog/<slug>/Blog.md"""

    path = BASE_DIR / "Blog" / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    return f"Blog saved to {path}"


@tool
def generate_cover(prompt: str, slug: str, name: str) -> str:
    """Generate blog cover image."""

    try:
        from google import genai

        client = genai.Client()
        res = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt],
        )

        for part in res.parts:
            if part.inline_data:
                image = part.as_image()

                path = BASE_DIR / "Blog" / slug / f"{name}.png"
                path.parent.mkdir(parents=True, exist_ok=True)

                image.save(str(path))
                return f"Saved cover: {path}"

        return "No image generated"

    except Exception as e:
        return f"Error: {e}"


def load_subagents(config_path: Path):
    with open(config_path) as f:
        config = yaml.safe_load(f)

    tool_map = {
        "web_search": web_search,
    }

    subagents = []

    for name, spec in config.items():
        agent = {
            "name": name,
            "description": spec["description"],
            "system_prompt": spec["system_prompt"],
        }

        if "tools" in spec:
            agent["tools"] = [tool_map[t] for t in spec["tools"]]

        subagents.append(agent)

    return subagents


blog_agent = create_deep_agent(
    model=init_chat_model("ollama:kimi-k2.5:cloud"),
    memory=["./AGENTS.md"],
    skills=["/skills/"],
    tools=[write_blog, generate_cover],
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),
    backend=FilesystemBackend(root_dir=BASE_DIR),
)
