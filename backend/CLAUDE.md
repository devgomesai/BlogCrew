# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Note: A separate **context-mode** routing block is injected into this project by a plugin (curl/wget/WebFetch blocked, `ctx_*` MCP tools preferred). Those rules are not stored in this file — this file covers the BlogCrew application itself.

## What this is

BlogCrew is a multi-agent blog-generation system built on **DeepAgents** (LangChain) and run via the **LangGraph** runtime. An orchestrator agent delegates to four subagents (planner → researcher → writer → editor) to research, write, edit, and illustrate a publish-ready blog post. Output lands in `Blog/<slug>/Blog.md` plus an AI-generated `cover.png`.

## Commands

```bash
uv sync                     # install deps (preferred); or: pip install -e .
langgraph dev               # run the agent; graph is exposed as "blogwriter" in LangGraph Studio
```

There is **no test suite, linter, or build step** configured. `src/test.py` is an untracked scratch file, not a test runner. Requires Python >=3.12.

Required env vars (in `.env`, see `.env.example`): `LLM_CHOICE` (`provider:model` form, e.g. `openrouter:...`, `ollama:...`, `google_genai:...`), `TAVILY_API_KEY`, plus optional `LANGSMITH_*` tracing keys.

Cover images default to the Pollinations gen API (`IMAGE_PROVIDER=pollinations`) running FLUX.1.1-pro, which needs `POLLONATION_API_KEY`. `IMAGE_PROVIDER=cloudflare` (Workers AI FLUX.1 schnell, free tier, no watermark, needs `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`) or `gemini` (needs `GOOGLE_API_KEY`) can be set explicitly. If Cloudflare is selected without credentials and the Pollinations key is present, `generate_cover` falls back to Pollinations.

## Architecture

The whole system is wired together in `src/agent.py` via a single `create_deep_agent(...)` call (`blog_agent`), which `langgraph.json` exposes as the `blogwriter` graph. Key pieces:

- **`src/agent.py`** — builds the orchestrator. Loads subagents from YAML, sets up the backend, and registers tools. The orchestrator's behavior (workflow, delegation rules) is driven by the memory file `/memory/AGENTS.md`, not by Python.
- **`src/subagents.yaml`** — declarative definitions of the four subagents (name, description, `system_prompt`, model, tools, skills). A `_defaults` block sets the shared model via a YAML anchor (`&model` / `*model`). `load_subagents()` merges defaults, validates required fields, and resolves tool names through a `tool_map`. **To add a subagent tool, you must register it in `tool_map` inside `load_subagents()`** — tools are referenced by string name in YAML.
- **`src/llm_service.py`** — `get_llm()` returns `init_chat_model(os.environ["LLM_CHOICE"])`. Model selection is fully env-driven; the subagents' model is set separately in `subagents.yaml`.
- **`src/tools.py`** — the three agent tools: `web_search` (Tavily search + fetch page → markdown), `write_blog` (saves to `Blog/<slug>/Blog.md`, validates slug against `SLUG_RE`), `generate_cover` (image model via `IMAGE_PROVIDER` → `Blog/<slug>/<name>.png`, centre-cropped and resized to 1408×768). All external calls use tenacity retries + a diskcache-backed cache (`.cache/web`, 24h TTL); only 5xx/network errors are retried, 4xx are returned as error strings.

### Virtual filesystem / backend (important, Windows-specific)

The agent reads skills and memory through **virtual paths** like `/skills/` and `/memory/`, which do not correspond to real absolute paths. `create_backend()` builds a `CompositeBackend` that routes:

- `/memory/` → `FilesystemBackend(root_dir=src/, virtual_mode=True)` → so `/memory/AGENTS.md` maps to `src/AGENTS.md`
- `/skills/` → `FilesystemBackend(root_dir=skills/, virtual_mode=True)`
- everything else → `StateBackend` (in-memory runtime state)

`virtual_mode=True` is a deliberate workaround for a `FilesystemBackend` path-resolution bug on Windows. When editing path logic in `agent.py`, preserve this mapping — the prompts in `AGENTS.md` and `subagents.yaml` reference these virtual paths literally (e.g. `cat /skills/blog-writer/SKILL.md`).

### Prompt-driven behavior (where the real logic lives)

Most of BlogCrew's behavior is in prompts/markdown, not code:

- **`src/AGENTS.md`** — the orchestrator's operating manual (loaded as `/memory/AGENTS.md`): startup protocol, 9-step workflow, delegation rules, parallelization limits, per-agent checklists, and a self-improvement protocol that lets agents edit these files.
- **`skills/blog-writer/`** — the `blog-writer` skill: `SKILL.md` defines writing voice/identity; `references/{patterns,sharp_edges,validations}.md` are the source-of-truth for how to build, diagnose, and validate posts. The writer and editor subagents load this skill via the `/skills/blog-writer/` path.

When changing the pipeline's *behavior* (section structure, SEO rules, delegation order, metadata fields), edit the relevant markdown — `AGENTS.md`, `subagents.yaml` prompts, or the skill files — not the Python.

## Conventions

- Output blogs go to repo-root `Blog/<slug>/` (`BLOG_DIR = BASE_DIR.parent / "Blog"`). Slugs must match `^[a-zA-Z0-9_-]+$`.
- The README's directory layout is slightly stale (it shows `src/Blog/` and `src/skills/`); the actual `Blog/` and `skills/` live at the repo root, per `agent.py`.
