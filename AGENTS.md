# AGENTS.md — BlogCrew

## Project overview
Multi-agent AI blog writing system built with [DeepAgents](https://github.com/deepagents/deepagents) + LangGraph. Four subagents (planner → researcher → writer → editor) produce markdown posts + cover images.

## Entrypoints
- `langgraph.json` → `src/agent.py:blog_agent` — LangGraph graph definition
- `langgraph dev` — run LangGraph Studio locally (then open printed URL)

## Architecture quirks
- **Skills directory**: `skills/` (repo root). The `README.md` says `src/skills/` — ignore that. `agent.py` sets `SKILLS_DIR = BASE_DIR.parent / "skills"`.
- **Agent memory**: `src/AGENTS.md` is loaded as memory (`/memory/AGENTS.md` via `CompositeBackend` virtual routing). It contains the agent's blog-writing workflow instructions. Do NOT conflate it with this file.
- **Virtual paths**: `CompositeBackend` routes `/memory/` → `src/`, `/skills/` → `skills/` (root). `virtual_mode=True` maps `/skills/blog-writer/SKILL.md` to `skills/blog-writer/SKILL.md`.
- **Two `CLAUDE.md` files**: root + `src/` — identical OpenCode context-mode routing rules. Either can be updated.

## Dependencies & setup
- Python `>=3.12`. Lockfile: `uv.lock` → use `uv sync`, not `pip install -e .`
- Model configured via `LLM_CHOICE` env var (`"provider:model"` format, e.g. `"ollama:kimi-k2.5:cloud"`)
- Required API keys: `TAVILY_API_KEY` (in `tools.py:web_search`), `GEMINI_API_KEY` → used as `GOOGLE_API_KEY` in `.env` for cover image generation
- `.env` is gitignored; copy `.env.example`

## Source layout
```
src/
  agent.py          — blog_agent definition, create_backend(), load_subagents()
  tools.py          — web_search (Tavily), write_blog, generate_cover (Gemini image gen)
  llm_service.py    — get_llm() reading LLM_CHOICE env var
  subagents.yaml    — planner/researcher/writer/editor configs with model & system prompts
  AGENTS.md         — agent memory file (blog-writing workflow instructions)
skills/
  blog-writer/
    SKILL.md              — writing identity, principles, reference system
    references/
      patterns.md         — blog writing patterns & anti-patterns
      validations.md      — regex-based validation rules
      sharp_edges.md      — common failure modes and fixes
Blog/
  <slug>/Blog.md    — generated blog post (markdown)
  <slug>/cover.png  — generated cover image
```

## Generated code / artifacts
- `Blog/<slug>/Blog.md` and `Blog/<slug>/cover.png` are generated outputs, not source
- `.langgraph_api/` is runtime state (gitignored)

## Dev commands
- `langgraph dev` — launch LangGraph Studio
- `uv sync` — install dependencies
- No test suite, no linter, no formatter detected in project config
