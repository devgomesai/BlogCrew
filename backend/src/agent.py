from pathlib import Path
import yaml
from dotenv import load_dotenv
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, FilesystemBackend, StateBackend
from langchain.agents.middleware import ToolCallLimitMiddleware
from src.llm_service import get_llm
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
    tool_map = {
        "web_search": web_search,
    }

    with open(config_path) as f:
        config = yaml.safe_load(f) or {}

    defaults = config.get("_defaults", {})
    agents = []

    for key, spec in config.items():
        if key == "_defaults":
            continue

        merged = {**defaults, **spec}

        required = ["name", "description", "system_prompt", "model"]
        missing = [f for f in required if f not in merged]
        if missing:
            raise ValueError(f"{key} missing fields: {missing}")

        tools = []
        for t in merged.get("tools", []):
            if t not in tool_map:
                raise ValueError(f"Unknown tool '{t}' in {key}")
            tools.append(tool_map[t])

        agent = {
            "name": str(merged["name"]),
            "description": str(merged["description"]),
            "system_prompt": str(merged["system_prompt"]),
            "model": get_llm(),  # ponytail: LM Studio for all subagents; re-read YAML model if per-agent models ever needed
        }

        if tools:
            agent["tools"] = tools

        if "skills" in merged:
            agent["skills"] = merged["skills"]

        agents.append(agent)

    return agents


backend = CompositeBackend(
    default=StateBackend(),
    routes={
        "/memory/": _memory_backend,
        "/skills/": _skills_backend,
    },
)


blog_agent = create_deep_agent(
    model=get_llm(), # LLM model
    memory=["/memory/AGENTS.md"],  # Memory file(s) agent can read/write
    tools=[write_blog, generate_cover],  # Tools exposed to the agent
    skills=["/skills/"],  # All the skills,
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),  # Load subagents config
    backend=backend,
    middleware=[
        ToolCallLimitMiddleware(tool_name="web_search", thread_limit=5, run_limit=3),
    ],
)

# See the Subagents
# agents = load_subagents(BASE_DIR / "subagents.yaml")

# for agent in agents:
#     print("\n" + "=" * 50)
#     pprint.pprint(agent)
