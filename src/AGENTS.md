# AGENTS.md

> **Living document.** Update this file whenever workflow patterns, skill paths, or delegation rules improve.  
> **Closest AGENTS.md wins.** Explicit user prompts override everything.

---

## Startup Protocol (ALWAYS RUN FIRST)

Before writing any blog or kicking off any subagent, run these checks in order:

```bash
# 1. Confirm working directory
ls -la

# 2. Confirm skills exist
ls /skills/

# 3. Confirm memory exists
ls /memory/

# 4. Read this file
cat /memory/AGENTS.md
```

Do not skip startup. Do not assume paths exist. Confirm before acting.

---

## Project Overview

This agent system produces publish-ready blog posts using a structured multi-agent pipeline.

- **Input:** Topic
- **Output:** `/Blog/<slug>/Blog.md` + `/Blog/<slug>/cover.png`
- **Pipeline:** planner → researcher → writer → editor → finalize

---

## Available Subagents


| Agent              | Role                                             | Input                          | Output                     |
| ------------------ | ------------------------------------------------ | ------------------------------ | -------------------------- |
| `planner-agent`    | Breaks topic into H2/H3 outline                  | topic, audience, tone, length  | structured outline         |
| `researcher-agent` | Gathers stats, examples, insights via web search | 1–3 related sections + outline | research notes per section |
| `writer-agent`     | Converts outline + research into prose           | outline + research notes       | draft section              |
| `editor-agent`     | Improves clarity, grammar, flow, SEO             | full combined draft            | polished draft             |


**Rules:**

- Never manually search — always delegate search to `researcher-agent`
- Writer and editor must both read `/skills/blog-writer/SKILL.md` before acting

---

## Progress Tracking (Required)

Call `write_todos` after every step using statuses: `pending` | `in_progress` | `completed`.

```
[ ] Startup checks          → pending
[ ] Plan outline            → pending
[ ] Save request            → pending
[ ] Research: Section 1     → pending
[ ] Research: Section 2     → pending
[ ] Research: Section N     → pending
[ ] Write: Section 1        → pending
[ ] Write: Section 2        → pending
[ ] Write: Section N        → pending
[ ] Edit full draft         → pending
[ ] Finalize & generate     → pending
```

Mark all items `completed` before returning output.

---

## Parallelization Rules

- Max **3 concurrent** subagent calls per iteration
- Max **5 delegation rounds** per task
- **Parallelize:** independent research calls for unrelated sections
- **Never parallelize:** dependent steps — research → write → edit must stay sequential

---

## Skill Usage (Critical)

### Understanding Skills

Skills are modular capabilities that provide you with detailed instructions and resources on-demand. Each skill contains:

- **Level 1 - Metadata**: Brief name and description 
- **Level 2 - Instructions**: Full detailed instructions 
- **Level 3 - Resources**: Reference docs, scripts, examples

## CRITICAL: You MUST Use Skills

Skills live in `/skills/`. Always read the relevant `SKILL.md` **before** writing or editing.

```bash
/skills/blog-writer/SKILL.md
```

- Writer agent reads skill before every section
- Editor agent reads skill before editing full draft
- Never override skill instructions

## Why This Matters

- Skills contain detailed, specialized instructions that are essential for quality responses.

---

## Formatting

- Markdown only
- `##` for main sections, `###` for subsections
- Bullet points for lists
- Fenced code blocks for all code snippets

---

## Output Requirements

```bash
# Save blog
write_blog → Blog/<slug>/Blog.md

# Generate cover image
generate_cover → Blog/<slug>/cover.png
```

Both must be called before returning. Do not return partial output.

---

## Critical Rules

- Never write the blog yourself — always delegate to subagents
- Always follow: planner → researcher → writer → editor
- Work section-by-section; combine only at finalize step
- Partial content with acknowledged gaps is better than stopping entirely

---

## Self-Improvement

Update this file or relevant skill files when confirmed improvements are found.

```bash
# Update workflow-level learnings
edit_file /memory/AGENTS.md

# Update skill-level learnings
edit_file /skills/<name>/SKILL.md
```

**Save when:**

- Delegation patterns consistently cause errors → fix here
- Writing patterns improve output quality → update skill
- Formatting rules cause broken Markdown → note the fix

**Do not save:**

- Topic-specific content
- One-off errors
- Unvalidated speculation

---

## Final Checklist

1. `write_todos` → all items `completed`
2. `write_blog` → `Blog/<slug>/Blog.md`
3. `generate_cover` → `Blog/<slug>/cover.png`

