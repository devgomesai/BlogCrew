#!/usr/bin/env python3
from pathlib import Path
import yaml
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from deepagents import create_deep_agent
from deepagents.backends import StateBackend
from deepagents.backends.utils import create_file_data
from src.tools import web_search

load_dotenv()

# Root directory of the project — all file paths are resolved relative to this
BASE_DIR = Path(r"C:\Users\Blog-Writer\src")


# Tool: Saves the final blog markdown content to disk
# Called by the agent at the end of the pipeline after editing is complete
@tool
def write_blog(slug: str, content: str) -> str:
    """Save blog to Blog/<slug>/Blog.md"""
    path = BASE_DIR / "Blog" / slug / "Blog.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"Blog saved to {path}"


# Tool: Generates a cover image for the blog using Google Gemini image model
# Called by the agent after the blog is written, using a descriptive prompt
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


# Loads subagent definitions from subagents.yaml
# Each subagent has a name, description, system_prompt, model, and optional tools
# Tool names in YAML are mapped to actual Python tool functions via tool_map
def load_subagents(config_path: Path):
    with open(config_path) as f:
        config = yaml.safe_load(f)

    tool_map = {"web_search": web_search}
    subagents = []

    for name, spec in config.items():
        agent = {
            "name": str(name),
            "description": str(spec["description"]),
            "system_prompt": str(spec["system_prompt"]),
            "model": str(spec["model"]),
        }
        if "tools" in spec:
            agent["tools"] = [tool_map[str(t)] for t in spec["tools"]]
        subagents.append(agent)

    return subagents


# Recursively loads all files from a skill directory into a dict
# Maps real disk paths → virtual paths (e.g. /skills/blog-writer/SKILL.md)
# This is needed because FilesystemBackend is broken on Windows,
# so we manually load files and serve them via PreloadedStateBackend instead
def load_skill_files(skill_dir: Path, virtual_prefix: str) -> dict:
    files = {}
    for file in skill_dir.rglob("*"):
        if file.is_file():
            virtual_path = virtual_prefix + file.relative_to(skill_dir).as_posix()
            files[virtual_path] = create_file_data(file.read_text(encoding="utf-8"))
            print(f"Loaded: {virtual_path}")
    return files


# Load skill files at startup so they are ready before any agent invocation
ALL_FILES = load_skill_files(BASE_DIR / "skills" / "blog-writer", "/skills/blog-writer/")

# Read AGENTS.md at startup and inject directly as system_prompt
# This bypasses the memory=[...] virtual path resolution which is also broken on Windows
AGENTS_MD = (BASE_DIR / "AGENTS.md").read_text(encoding="utf-8")


# Custom backend that extends StateBackend to pre-seed files into agent state
# StateBackend reads files from runtime.state["files"] — so we merge preloaded
# skill files into state on every ls/read call, making them always available
# to the agent without requiring files to be passed via invoke()
class PreloadedStateBackend(StateBackend):
    def __init__(self, runtime, preloaded_files: dict):
        super().__init__(runtime)
        self._preloaded = preloaded_files

    def _get_files(self):
        # Merge preloaded files with any files already in state
        # State files take precedence (e.g. files written by the agent during a run)
        files = self.runtime.state.get("files", {})
        return {**self._preloaded, **files}

    def ls_info(self, path):
        # Inject preloaded files into state before listing directory
        self.runtime.state["files"] = self._get_files()
        return super().ls_info(path)

    def read(self, file_path, offset=0, limit=2000):
        # Inject preloaded files into state before reading a file
        self.runtime.state["files"] = self._get_files()
        return super().read(file_path, offset, limit)


# Factory function passed to create_deep_agent as backend=
# Called once per runtime instance, returns a PreloadedStateBackend
# with all skill files pre-seeded
def my_backend(runtime):
    return PreloadedStateBackend(runtime, ALL_FILES)


# Create the main blog agent graph
# - system_prompt: AGENTS.md content injected directly (workflow + subagent instructions)
# - skills: virtual path to blog-writer SKILL.md (served via PreloadedStateBackend)
# - tools: write_blog and generate_cover available to the main agent
# - subagents: planner, researcher, writer, editor loaded from subagents.yaml
# - backend: PreloadedStateBackend factory that serves skill files on Windows
blog_agent = create_deep_agent(
    model=init_chat_model("ollama:kimi-k2.5:cloud"),
    skills=["/skills/blog-writer/"],
    system_prompt=AGENTS_MD,           # AGENTS.md injected directly into system prompt
    tools=[write_blog, generate_cover],
    subagents=load_subagents(BASE_DIR / "subagents.yaml"),
    backend=my_backend,
)