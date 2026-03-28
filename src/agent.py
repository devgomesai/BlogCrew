from pathlib import Path
import yaml
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, FilesystemBackend, StateBackend
from src.tools import web_search

# Load environment variables from a .env file
load_dotenv()

# ----------------------------
# Directory Setup
# ----------------------------
# BASE_DIR: directory where this script resides
BASE_DIR = Path(__file__).parent

# BLOG_DIR: where blogs will be saved
BLOG_DIR = BASE_DIR.parent / "Blog"

# SKILLS_DIR: where agent skills are stored
SKILLS_DIR = BASE_DIR.parent / "skills"

# ----------------------------
# Backend Configuration
# ----------------------------
# FilesystemBackend handles file storage for the agent
# virtual_mode=True ensures that virtual paths like "/skills/" or "/memory/"
# correctly map to the underlying filesystem path on Windows/Unix.
_memory_backend = FilesystemBackend(root_dir=str(BASE_DIR), virtual_mode=True)
_skills_backend = FilesystemBackend(root_dir=str(SKILLS_DIR), virtual_mode=True)

# ----------------------------
# Tools
# ----------------------------

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


# ----------------------------
# Subagents Loader
# ----------------------------
def load_subagents(config_path: Path) -> list[dict]:
    """
    Load subagents configuration from YAML
    
    Args:
        config_path: Path to subagents.yaml
    
    Returns:
        List of subagent configs, including tools and skills
    """
    tool_map = {"web_search": web_search}  # Map tool names to functions

    with open(config_path) as f:
        config = yaml.safe_load(f)

    # Construct list of subagent definitions for create_deep_agent
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
            **({"skills": spec["skills"]} if "skills" in spec else {}),  # include skills if defined
        }
        for name, spec in config.items()
    ]

print(load_subagents(BASE_DIR / "subagents.yaml"))

# ----------------------------
# Backend Factory
# ----------------------------
def create_backend(runtime) -> CompositeBackend:
    """
    Create a CompositeBackend for the agent
    
    CompositeBackend routes virtual paths like:
        /memory/ -> _memory_backend
        /skills/ -> _skills_backend
    
    StateBackend is used as default for in-memory runtime state
    """
    return CompositeBackend(
        default=StateBackend(runtime),
        routes={
            "/memory/": _memory_backend,
            "/skills/": _skills_backend,
        },
    )


# ----------------------------
# Agent Creation
# ----------------------------
blog_agent = create_deep_agent(
    model=init_chat_model("openai:gpt-4o-mini-2024-07-18"),  # LLM model
    memory=["/memory/AGENTS.md"],  # Memory file(s) agent can read/write
    tools=[write_blog, generate_cover],  # Tools exposed to the agent
    skills=["/skills/"], # All the skills
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),  # Load subagents config
    backend=create_backend,  # Backend function providing virtual path routing
)