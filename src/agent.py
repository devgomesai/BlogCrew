import os
from pathlib import Path
import yaml
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, FilesystemBackend, StateBackend
from src.tools import generate_cover, web_search, write_blog

# Load environment variables from a .env file
load_dotenv()


# BASE_DIR: directory where this script resides
BASE_DIR = Path(__file__).parent

# BLOG_DIR: where blogs will be saved
BLOG_DIR = BASE_DIR.parent / "Blog"

# SKILLS_DIR: where agent skills are stored
SKILLS_DIR = BASE_DIR.parent / "skills"


# FilesystemBackend handles file storage for the agent
# virtual_mode=True ensures that virtual paths like "/skills/" or "/memory/"
# correctly map to the underlying filesystem path on Windows/Unix.
_memory_backend = FilesystemBackend(root_dir=str(BASE_DIR), virtual_mode=True)
_skills_backend = FilesystemBackend(root_dir=str(SKILLS_DIR), virtual_mode=True)


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
            "name": str(spec["name"]),
            "description": str(spec["description"]),
            "system_prompt": str(spec["system_prompt"]),
            "model": str(spec["model"]),
            **(
                {"tools": [tool_map[str(t)] for t in spec["tools"]]}
                if "tools" in spec
                else {}
            ),
            **({"skills": spec["skills"]} if "skills" in spec else {}),
        }
        for spec in config.values()
    ]


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


blog_agent = create_deep_agent(
    model=init_chat_model(os.environ["LLM_CHOICE"]),  # LLM model
    memory=["/memory/AGENTS.md"],  # Memory file(s) agent can read/write
    tools=[write_blog, generate_cover],  # Tools exposed to the agent
    skills=["/skills/"],  # All the skills
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),  # Load subagents config
    backend=create_backend,  # Backend function providing virtual path routing
)
