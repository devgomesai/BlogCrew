# BlogCrew UI

Frontend for [BlogCrew](https://github.com/devgomesai/BlogCrew) — a multi-agent AI blog writing system. Built with Next.js 16, Tailwind CSS, Radix UI, and the LangGraph SDK.

## Features

- **Chat interface** — talk to the BlogCrew orchestrator to generate blog posts
- **Agent pipeline visualization** — see each subagent (Planner → Researcher → Writer → Editor) working in real time
- **Published blogs** (`/blogs`) — browse generated posts with cover images, syntax-highlighted markdown, and code blocks
- **Dark / light theme** — toggle persisted to localStorage
- **Configurable** — set deployment URL, assistant ID, and LangSmith API key via the settings dialog

## Quickstart

```bash
# Install dependencies
yarn install

# Run the dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000), configure your LangGraph deployment URL and assistant ID in the settings dialog, and start generating blogs.

## Connecting to BlogCrew

Deploy the BlogCrew agent from the parent repository:

```bash
cd BlogCrew
langgraph dev
```

Use the printed API URL (e.g. `http://127.0.0.1:2024`) and assistant ID (`blogwriter`) in the UI settings.

## Environment Variables

Optional — settings configured in the UI take precedence:

```env
NEXT_PUBLIC_LANGSMITH_API_KEY="lsv2_xxxx"
```

## Blog Viewer

Generated blog posts saved to the `Blog/` directory at the repo root are automatically discoverable:

- `/blogs` — card grid with cover images and titles
- `/blogs/[slug]` — full post with rendered markdown, syntax highlighting, and cover image

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with Turbopack |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format with Prettier |
