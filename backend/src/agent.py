from pathlib import Path

import yaml
from deepagents import FilesystemPermission, create_deep_agent
from deepagents.backends import CompositeBackend, FilesystemBackend, StateBackend
from dotenv import load_dotenv
from langchain.agents.middleware import ToolCallLimitMiddleware, TodoListMiddleware

from src.llm_service import get_llm
from src.tools import generate_cover, web_search, write_blog

# Load environment variables from a .env file
load_dotenv()


# BASE_DIR: directory where this script resides
BASE_DIR = Path(__file__).parent

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

        # 'model' is deliberately not required: get_llm() overrides it below.
        required = ["name", "description", "system_prompt"]
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
            # ponytail: one env-driven model for every subagent. Read
            # merged["model"] here the day per-agent models are actually wanted.
            "model": get_llm(),
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
    # Filesystem access is allow-listed (first-match-wins, then default-allow,
    # so the catch-all deny at the end is what makes this a strict allow-list):
    #   1. Pipeline workspace — research notes, drafts, edits (read + write)
    #   2. Harness artifacts — offloaded tool results / blobs / history
    #   3. Read-only context — /memory/AGENTS.md and /skills/**
    #   4. Everything else under the virtual routes is denied (this is what
    #      stops the agent reading source code through /memory/*.py — the
    #      /memory/ route maps to the src/ tree)
    #   5. Everything outside the routes is denied too
    # Skills and memory middleware read through the same backend, so the
    # allow rules must cover exactly what they load.
    permissions=[
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/memory/sandbox", "/memory/sandbox/**"],
            mode="allow",
        ),
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/blobs/**", "/large_tool_results/**", "/conversation_history/**"],
            mode="allow",
        ),
        FilesystemPermission(
            operations=["read"],
            paths=["/memory/AGENTS.md", "/skills", "/skills/**"],
            mode="allow",
        ),
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/memory/**", "/skills/**"],
            mode="deny",
        ),
        FilesystemPermission(
            operations=["read", "write"],
            paths=["/**"],
            mode="deny",
        ),
    ],
    middleware=[
        # TodoListMiddleware is opt-in since deepagents 0.7 — restoring it
        # re-enables write_todos and the todos state the workshop UI renders.
        TodoListMiddleware(),
        ToolCallLimitMiddleware(tool_name="web_search", thread_limit=5, run_limit=3),
    ],
)
