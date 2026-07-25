# BlogCrew ✍️🤖

BlogCrew is a multi-agent AI system that autonomously researches, writes, edits, and generates cover images for publish-ready blog posts. Built with DeepAgents + LangGraph, it splits work across specialized subagents (planner, researcher, writer, editor) and produces Markdown articles plus AI-generated covers.

Why use BlogCrew?

- Produces structured, reference-backed blog drafts.
- Built-in web research (Tavily) and image generation (Gemini).
- Configurable subagent prompts and skills for control over voice & quality.

Quickstart (5 minutes)

1. Clone:
  ```bash
   git clone https://github.com/devgomesai/BlogCrew.git
   cd BlogCrew
  ```
2. Install deps (preferred):
  ```bash
   uv sync
  ```
   or
3. Copy `.env.example` → `.env` and set required keys (see Configuration).
4. Run LangGraph Studio:
  ```bash
   langgraph dev
  ```
   Open the printed URL and run the `blogwriter` graph.

Production notes — required configuration

- Python: 3.12+
- Environment variables (example):
  ```env
  LLM_CHOICE="provider:model"    # e.g. openrouter:anthropic/claude-sonnet-5
  TAVILY_API_KEY=your_tavily_api_key
  GOOGLE_API_KEY=your_google_api_key
  ```
- The subagents' model & behavior are defined in `src/subagents.yaml`.

How it works (high level)

- Planner builds an H2/H3 outline.
- Researcher performs targeted web searches (Tavily) per section.
- Writer generates section text using the blog-writer skill and references.
- Editor polishes the whole draft and enforces validations.
- generate_cover uses Gemini to create a cover image saved alongside the article.

Outputs

- Blog//Blog.md — generated article (Markdown)
- Blog//cover.png — generated cover image

Project layout

```
├── src/
│   ├── agent.py        # Orchestrator and backend mapping
│   ├── tools.py        # web_search, write_blog, generate_cover
│   ├── llm_service.py  # Model selection (LLM_CHOICE)
│   ├── subagents.yaml  # Planner/Researcher/Writer/Editor configs
│   └── AGENTS.md       # Orchestrator manual loaded as /memory/AGENTS.md
├── skills/             # Skills (blog-writer + references)
├── Blog/               # Generated blog posts and covers
├── langgraph.json
└── pyproject.toml
```

Windows-specific note
The project uses a CompositeBackend that maps virtual paths (/memory/, /skills/) to local directories to avoid a FilesystemBackend path-resolution issue on Windows. Do not change that routing unless testing on non-Windows environments.

Development

- Use `uv sync` to install dev dependencies (preferred). Python >=3.12 required.
- Edit skill prompts and `src/AGENTS.md` to change pipeline behavior — most logic lives in markdown prompts, not code.

Contributing

- Open issues or PRs. For major changes, file an issue first describing the goal and design.
- Keep changes small and document prompt/skill changes in commit messages.

Troubleshooting

- No output files: check `.env` and that `LLM_CHOICE` and API keys are valid.
- Model errors: ensure provider-specific keys are present and the `LLM_CHOICE` format is `provider:model`.

Credits & License

- Inspired by LangChain DeepAgents content-builder example.
- Repository: [https://github.com/devgomesai/BlogCrew](https://github.com/devgomesai/BlogCrew)

