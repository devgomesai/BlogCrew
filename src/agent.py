from pathlib import Path
import yaml
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, FilesystemBackend, StateBackend
from src.tools import web_search

load_dotenv()

BASE_DIR = Path(__file__).parent
BLOG_DIR = BASE_DIR.parent / "Blog"
SKILLS_DIR = BASE_DIR.parent / "skills"

_memory_backend = FilesystemBackend(root_dir=str(BASE_DIR), virtual_mode=False)
_skills_backend = FilesystemBackend(root_dir=str(SKILLS_DIR), virtual_mode=False)


@tool
def write_blog(slug: str, content: str) -> str:
    """Save blog to Blog/<slug>/Blog.md"""
    path = BLOG_DIR / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"Blog saved to {path}"


@tool
def generate_cover(prompt: str, slug: str, name: str) -> str:
    """Generate and save a cover image to Blog/<slug>/<name>.png"""
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


def load_subagents(config_path: Path) -> list[dict]:
    tool_map = {"web_search": web_search}

    with open(config_path) as f:
        config = yaml.safe_load(f)

    return [
        {
            "name": str(name),
            "description": str(spec["description"]),
            "system_prompt": str(spec["system_prompt"]),
            "model": str(spec["model"]),
            **(
                {"tools": [tool_map[str(t)] for t in spec["tools"]]}
                if "tools" in spec
                else {}
            ),
            **({"skills": spec["skills"]} if "skills" in spec else {}),  # ← add this
        }
        for name, spec in config.items()
    ]


def create_backend(runtime) -> CompositeBackend:
    return CompositeBackend(
        default=StateBackend(runtime),
        routes={
            "/memory/": _memory_backend,
            "/skills/": _skills_backend,
        },
    )


blog_agent = create_deep_agent(
    model=init_chat_model("openai:gpt-4o-mini-2024-07-18"),
    memory=["/memory/AGENTS.md"],
    skills=["/skills/"],
    tools=[write_blog, generate_cover],
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),
    system_prompt=(
        "You are an autonomous multi-agent blog system.\n\n"
        "On start:\n"
        "1. Read /memory/AGENTS.md — your workflow, delegation rules, and quality standards\n"
        "2. Read /skills/blog-writer/SKILL.md — writing style, formatting, and structure guidelines\n\n"
        "Treat both as source of truth. Never proceed without reading them first."
    ),
    backend=create_backend,
)
