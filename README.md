# BlogCrew ✍️🤖

A powerful, multi-agent AI system built with [DeepAgents](https://github.com/deepagents/deepagents). This project autonomously researches, writes, edits, and generates cover images for high-quality blog posts.

## How it Works

The system orchestrates specialized subagents to handle different parts of the content creation pipeline:

- 🧠 **Planner**: Creates a structured, logical outline with H2/H3 headings and subsections.
- 🔍 **Researcher**: Uses Tavily to perform targeted web searches, extracting key insights, statistics, and examples.
- ✍️ **Writer**: Expands research notes into engaging, professional blog sections following the blog-writer skill.
- 📝 **Editor**: Refines the final blog for clarity, flow, grammar, and SEO without hallucinating facts.

The agent also integrates with Google's **Gemini image model** to generate custom cover images for each blog post.

## Architecture

```
blog_agent (orchestrator)
├── planner-agent       → generates outline
├── researcher-agent    → web search per section
├── writer-agent        → writes section-by-section
└── editor-agent        → polishes full draft
```

Skills and workflow instructions are loaded at startup via a  `CompositeBackend`, which works around a known `FilesystemBackend` path resolution issue on Windows.

## Prerequisites

- **Python**: `>=3.12`
- **Model**: Set `LLM_CHOICE` to any `provider:model` supported by LangChain's `init_chat_model` (e.g. `openrouter:...`, `ollama:...`, `google_genai:...`, `openai:...`). The subagents' model is set separately in `src/subagents.yaml`.
- **API Keys**:
  - `TAVILY_API_KEY`: For web research via Tavily.
  - `GOOGLE_API_KEY`: For generating cover images via the Gemini image model.
  - Provider key for your `LLM_CHOICE` (e.g. `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).

## Installation

```bash
# Clone the repository
git clone https://github.com/devgomesai/BlogCrew.git
cd BlogCrew

# Install dependencies (preferred)
uv sync

# OR with pip
pip install -e .
```

### Environment Variables

Create a `.env` file in the root directory:

```env
LLM_CHOICE="openrouter:nvidia/nemotron-3-ultra-550b-a55b"  # provider:model
TAVILY_API_KEY=your_tavily_api_key
GOOGLE_API_KEY=your_google_api_key
```

See `.env.example` for the full list (including optional `LANGSMITH_*` tracing keys).

## Usage

### LangGraph Studio

```bash
langgraph dev
```

Open the Studio URL printed in the terminal. The agent is exposed as `blogwriter`.

### Example Prompt

```
Use the blog-writer skill to write a blog on "Python for Data Science"
and save it using write_blog with slug: python-data-science
```

### Output Structure

```
Blog/
└── your-blog-slug/
    ├── Blog.md       # Complete generated article
    └── cover.png     # AI-generated cover image
```

## Project Structure

```
BlogCrew/
├── src/
│   ├── agent.py          # Orchestrator wiring (create_deep_agent), backend routing
│   ├── tools.py          # web_search (Tavily), write_blog, generate_cover
│   ├── llm_service.py    # get_llm() → init_chat_model(LLM_CHOICE)
│   ├── subagents.yaml    # Planner, Researcher, Writer, Editor configs
│   └── AGENTS.md         # Orchestrator manual, loaded as /memory/AGENTS.md
├── skills/
│   └── blog-writer/
│       ├── SKILL.md      # Blog writing skill definition
│       └── references/   # patterns / sharp_edges / validations docs
├── Blog/                 # Generated blog output directory
├── langgraph.json        # LangGraph CLI configuration
└── pyproject.toml        # Project dependencies and metadata
```

## 🙌 Inspiration

This project is inspired by the
[Content Builder Agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent)
from the LangChain DeepAgents repository.