# BlogCrew ✍️🤖

A powerful, multi-agent AI system built with [DeepAgents](https://github.com/deepagents/deepagents). This project autonomously researches, writes, edits, and generates cover images for high-quality blog posts.

## How it Works

The system orchestrates specialized subagents to handle different parts of the content creation pipeline:

- 🧠 **Planner**: Creates a structured, logical outline with H2/H3 headings and subsections.
- 🔍 **Researcher**: Uses Tavily to perform targeted web searches, extracting key insights, statistics, and examples.
- ✍️ **Writer**: Expands research notes into engaging, professional blog sections following the blog-writer skill.
- 📝 **Editor**: Refines the final blog for clarity, flow, grammar, and SEO without hallucinating facts.

The agent also integrates with Google's **Gemini 2.5 Flash** to generate custom cover images for each blog post.

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
- **Ollama**: Access to `kimi-k2.5:cloud` (or configure your preferred model in `src/subagents.yaml` and `src/agent.py`)
- **API Keys**:
  - `TAVILY_API_KEY`: For web research via Tavily.
  - `GEMINI_API_KEY`: For generating cover images via `gemini-2.5-flash-image`.

## Installation

```bash
# Clone the repository
git clone https://github.com/devgomesai/BlogCrew.git
cd BlogCrew

# Install dependencies
pip install -e .

# Pull the Ollama model
ollama pull kimi-k2.5:cloud

# OR if using uv
uv sync
```

### Environment Variables

Create a `.env` file in the root directory:

```env
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key
```

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
src/Blog/
└── your-blog-slug/
    ├── Blog.md       # Complete generated article
    └── cover.png     # AI-generated cover image
```

## Project Structure

```
Blog-Writer/
├── src/
│   ├── agent.py          # Main agent, tools, PreloadedStateBackend
│   ├── tools.py          # Tavily search and web tools
│   ├── subagents.yaml    # Planner, Researcher, Writer, Editor configs
│   ├── AGENTS.md         # Workflow instructions injected as system prompt
│   ├── skills/
│   │   └── blog-writer/
│   │       ├── SKILL.md              # Blog writing skill definition
│   │       └── references/           # Supporting reference docs
│   └── Blog/             # Generated blog output directory
├── langgraph.json        # LangGraph CLI configuration
└── pyproject.toml        # Project dependencies and metadata
```

## 🙌 Inspiration

This project is inspired by the
[Content Builder Agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent)
from the LangChain DeepAgents repository.