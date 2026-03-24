# BlogCrew ✍️🤖

A powerful, multi-agent AI system built with [DeepAgents](https://github.com/deepagents/deepagents) and [LangGraph](https://github.com/langchain-ai/langgraph). This project autonomously researches, writes, edits, and generates cover images for high-quality blog posts, along with ready-to-use social media content.

## How it Works

The system orchestrates specialized subagents to handle different parts of the content creation pipeline:

- 🧠 **Planner**: Creates a structured, logical outline with headings and subsections.
- 🔍 **Researcher**: Uses Tavily to perform targeted web searches, extracting key insights, statistics, and examples.
- ✍️ **Writer**: Expands the research into engaging, professional blog sections.
- 📝 **Editor**: Refines the final blog for clarity, flow, grammar, and SEO without hallucinating facts.
- 📱 **Social**: Generates a LinkedIn post and a Twitter/X thread based on the final article.

Additionally, the agent integrates with Google's **Gemini 2.5 Flash** to generate custom cover images for your blog posts.

## Prerequisites

- **Python**: `>=3.12`
- **Ollama**: Access to `kimi-k2.5:cloud` (or configure your preferred model in `src/subagents.yaml` and `src/agent.py`)
- **API Keys**:
  - `TAVILY_API_KEY`: For web research.
  - `GEMINI_API_KEY`: For generating cover images via `gemini-2.5-flash-image`.

## Installation

This project uses modern Python packaging. We recommend using `uv` or `pip`:

```bash
# Clone the repository
git clone https://github.com/devgomesai/Blog-Writer-Agent-.git
cd blog-writer

# Install dependencies
pip install -e .

# Pull ollama model
ollama pull kimi-k2.5:cloud
# 
# OR if using uv
uv sync
```

### Environment Variables

Create a `.env` file in the root directory and add your API keys:

```env
TAVILY_API_KEY=your_tavily_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Usage

You can run the agent using the LangGraph CLI or by invoking it directly in your code.

### Using LangGraph CLI

Since the project includes a `langgraph.json` configuration, you can use the LangGraph CLI/Studio:

```bash
langgraph dev
```

The agent is exposed as `blogwriter` (mapped to `src/agent.py:blog_agent`).

### Output Structure

The agent saves generated blogs in the `src/Blog` directory, organized by topic slugs:

```
src/Blog/
└── your-blog-slug/
    ├── Blog.md         # The complete generated article
    └── cover.png       # The AI-generated cover image
```

## Project Structure

- `src/agent.py`: Main agent definition and tool orchestration (`write_blog`, `generate_cover`).
- `src/tools.py`: Search and webpage processing tools using Tavily.
- `src/subagents.yaml`: System prompts and configurations for the Planner, Researcher, Writer, Editor, and Social agents.
- `langgraph.json`: LangGraph configuration.
- `pyproject.toml`: Project dependencies and metadata.

## 🙌 Inspiration

This project is inspired by the 
[Content Builder Agent example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) 
from the LangChain DeepAgents repository.