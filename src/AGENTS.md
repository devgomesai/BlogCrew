# AGENTS.md

> **Living document.** Update this file whenever workflow patterns, skill paths, or delegation rules improve.  
> **Closest AGENTS.md wins.** Explicit user prompts override everything.  
> **NEVER assume files exist. Paths are VIRTUAL — always confirm before reading.**

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

# 5. Read and internalize the blog-writer skill (MANDATORY — before ANY other step)
cat /skills/blog-writer/SKILL.md
cat /skills/blog-writer/references/
```

Do not skip startup. Do not assume paths exist. Confirm before acting.

> **After reading the skill**, extract and hold the following in working context:
>
> - Required `BlogPost` fields and their formats (slug, title, excerpt, date, readTime, category, author, image, seo)
> - Voice and tone rules (audience, perspective, phrasing)
> - Content template (H2/H3 structure, standard section names)
> - SEO rules (title pattern, description length, keyword count)
>
> Every subagent that writes or edits **must operate from this extracted context** — not from generic defaults.

---

## Project Overview

This agent system produces publish-ready blog posts using a structured multi-agent pipeline.

- **Input:** Topic
- **Output:** `/Blog/<slug>/Blog.md` + `/Blog/<slug>/cover.png`
- **Pipeline:** skill-read → plan → research → write → verify → edit → finalize

---

## Available Subagents


| Agent              | Role                                                     | Input                                    | Output                    |
| ------------------ | -------------------------------------------------------- | ---------------------------------------- | ------------------------- |
| `planner-agent`    | Breaks topic into H2/H3 outline                          | topic + skill context                    | structured outline        |
| `researcher-agent` | Gathers stats, examples, and insights via web search     | 1–3 focused section topics + outline     | structured research notes |
| `writer-agent`     | Converts outline + research into prose                   | outline + research notes + skill context | draft section             |
| `editor-agent`     | Improves clarity, grammar, flow, SEO; validates metadata | full combined draft + skill context      | polished draft + metadata |


**Delegation rules:**

- **Always delegate web research** to `researcher-agent` — never search yourself
- **Always delegate writing** to `writer-agent` — never write blog prose yourself
- **Always delegate editing** to `editor-agent` — never polish or validate metadata yourself
- Pass the extracted `--- SKILL CONTEXT ---` block in every subagent call — never strip it

---

## Workflow

Follow these steps in order. Do not skip or reorder.

**Step 1 — Plan and Track**
Break the task into focused steps using `write_todos`. Update after every completed step.

**Step 2 — Read Skill and Extract Context**
Run the Startup Protocol. Read `SKILL.md` and `blog-patterns.md`. Construct the `--- SKILL CONTEXT ---` block (see format below). Hold in working context for all downstream calls.

**Step 3 — Save Request**
Use `write_file` to save the user's topic and constraints to `/request.md`.

**Step 4 — Plan Outline**
Delegate to `planner-agent` with: topic + skill context.
Receive: H2/H3 outline + suggested slug, category, readTime estimate + flagged sections needing research.

**Step 5 — Research**
Delegate to `researcher-agent`. Group 2–3 related sections per call. Up to 6 calls total.
Parallelize independent section research; never parallelize with dependent steps.

**Step 6 — Write**
Delegate to `writer-agent` one section at a time.
Pass: outline section + research notes for that section + skill context.

**Step 7 — Verify**
After all sections return, check if content is sufficient and complete.
If gaps exist, make one additional research or writing call to fill them — then proceed regardless.

**Step 8 — Edit**
Delegate the full combined draft to `editor-agent` with skill context.
Receive: polished draft + validated `BlogPost` metadata block.

**Step 9 — Finalize and Return**
Run the Final Checklist. Write output files. Return to user.

---

## Skill Read Protocol (Critical — Non-Negotiable)

### When to read

Read **once at startup** by the orchestrator. Individual agents do **not** re-read the file — they receive the extracted context block in their input prompt.

### Extracted context format

After reading the skill files, construct this block and include it verbatim in every subagent call:

```
--- SKILL CONTEXT (blog-writer) ---
Audience:        [from blog-patterns.md]
Tone:            [from blog-patterns.md]
Perspective:     [from blog-patterns.md]
Standard sections: [ordered list from blog-patterns.md]
BlogPost fields: slug | title | excerpt | content | date | readTime | category | author | image | seo
Slug format:     YYYY-MM-DD-topic, lowercase, hyphenated
Date format:     ISO YYYY-MM-DD
readTime:        word count ÷ 225, rounded to nearest minute
SEO:             title = topic + Jamaica relevance; description = 1 sentence; keywords = 3–5 items
Content template: H2 matching title → H3 subheads → numbered action steps → Final Note → Sources
---
```

### Priority rules

1. Explicit user prompt — highest priority
2. Skill instructions — governs writing, tone, formatting, SEO, and metadata
3. AGENTS.md formatting rules — fallback only; yield to skill on any conflict

If a conflict is found, note it at the finalize step and update this file.

---

## Progress Tracking (Required)

Call `write_todos` after every workflow step. Statuses: `pending` | `in_progress` | `completed`.

```
[ ] Startup checks               → pending
[ ] Read skill + extract context → pending
[ ] Save request                 → pending
[ ] Plan outline                 → pending
[ ] Research: Section 1          → pending
[ ] Research: Section 2          → pending
[ ] Research: Section N          → pending
[ ] Write: Section 1             → pending
[ ] Write: Section 2             → pending
[ ] Write: Section N             → pending
[ ] Verify coverage              → pending
[ ] Edit full draft              → pending
[ ] Validate BlogPost fields     → pending
[ ] Finalize & generate          → pending
```

Mark ALL items `completed` before returning. Never return with items still pending.

---

## Parallelization Rules

- Max **3 concurrent** subagent calls per iteration
- Max **5 delegation rounds** per task
- **Parallelize:** independent research calls for unrelated sections
- **Never parallelize:** skill-read → plan → write → edit — strictly sequential
- Bias toward single comprehensive tasks over many narrow ones

---

## Per-Agent Instructions

### Planner Agent

Receives: topic + audience + tone + length + skill context.

Must:

1. Use standard section names from `blog-patterns.md` as the default outline skeleton
2. Adapt or extend only where the topic clearly requires it
3. Output: H2/H3 outline + suggested `slug`, `category`, `readTime` estimate
4. Flag any sections needing external data for researcher-agent

### Researcher Agent

Receives: 1–3 focused section topics + outline.

Must:

1. Search for Jamaica-relevant data, statistics, and examples where applicable
2. Return structured notes per section: `fact | source URL | relevance`
3. Never write prose — return raw notes only

### Writer Agent

Receives: outline section + research notes + skill context.

Must:

1. Re-read the `--- SKILL CONTEXT ---` block before writing each section
2. Write in second person ("you") with confident, advisory tone
3. Follow the content template: H2 title → H3 subheads → action steps as numbered list or bolded lead-ins
4. Cite sources inline with numbered references matching the Sources section
5. Return one section at a time — do not combine sections

### Editor Agent

Receives: full combined draft + skill context.

Must:

1. Validate every `BlogPost` field:
  - `slug`: lowercase, hyphenated, `YYYY-MM-DD-topic`
  - `title`: clear, professional, Jamaica-relevant
  - `excerpt`: 1–2 sentences matching opening value of post
  - `content`: starts with H2 matching title
  - `date`: ISO `YYYY-MM-DD`
  - `readTime`: word count ÷ 225, rounded to nearest minute
  - `category`: existing category unless new one is clearly justified
  - `author`: consistent with existing author
  - `image`: `/blog/<filename>.png`
  - `seo.title`, `seo.description`, `seo.keywords`: 3–5 keywords, Jamaica-relevant where possible
2. Improve clarity, grammar, flow — do not change structure
3. Ensure paragraphs are short and direct
4. Confirm post ends with action-oriented close or contact invitation
5. Return: polished draft + completed metadata block

---

## Output Guidelines

### Presentation rules

- Use `##` for sections, `###` for subsections
- Write in paragraphs; use lists only where the content is genuinely list-shaped
- **No self-referential language**: no "I wrote...", "I researched...", "The agent produced..."
- **No meta-commentary**: no methodology sections, no workflow references in the output
- No statements like "the user requested" or "this post satisfies"

### Content requirements

- Short, direct paragraphs
- Action steps as numbered lists or bolded lead-ins
- Sources section with numbered entries at the end
- Post ends with invitation to act or contact

---

## Output Files

```bash
# Save blog post
write_blog → Blog/<slug>/Blog.md

# Generate cover image
generate_cover → Blog/<slug>/cover.png
```

Both must be written before returning. Do not return partial output.

---

## Critical Rules

- Never write blog prose yourself — always delegate to subagents
- Never search yourself — always delegate to researcher-agent
- Always follow workflow steps in order
- Skill context must travel with every subagent call — never strip it
- Work section-by-section; combine only at the edit step
- A partial response with acknowledged gaps is always better than stopping entirely
- If tools fail or return insufficient data, use available information for best-effort output

---

## Self-Improvement

### Scope test — decide what to save

Before saving any learning, ask: **would this apply in a new conversation on a different topic?**

- **No — task-specific** (this topic, this post, this request): **do not save**
- **Yes — agent-wide** (recurring errors, reliable patterns, API behavior): **save immediately**

### Where to save


| Learning type                                     | Save to                                           |
| ------------------------------------------------- | ------------------------------------------------- |
| Workflow, delegation strategy, general procedure  | `/memory/AGENTS.md`                               |
| Writing patterns, blog structure, SEO rules       | `/skills/blog-writer/SKILL.md`                    |
| Style patterns, section templates, voice examples | `/skills/blog-writer/references/` |


Always prefer **updating an existing section** over creating new content.
Keep additions concise — 1–3 lines with the problem and fix is ideal.

### When to update

- A skill instruction consistently produces wrong output → fix the relevant SKILL.md
- A new section structure produces better engagement → add to `blog-patterns.md`
- A `BlogPost` field keeps failing validation → tighten the editor checklist here
- A delegation pattern causes repeated errors → update the workflow steps here

### When NOT to update

- One-off errors from bad input or transient issues
- Speculative improvements not validated through actual execution
- Topic-specific content or one-time observations

### How to update

**Update immediately** — the moment a fix is confirmed, persist it before moving on. Do not batch.

```bash
edit_file /memory/AGENTS.md
edit_file /skills/blog-writer/SKILL.md
edit_file /skills/blog-writer/references/
```

---

## Final Checklist (Hard Gate — Run Before Returning)

1. `write_todos` → ALL items marked `completed`
2. All `BlogPost` fields validated by editor-agent
3. `write_blog` → `Blog/<slug>/Blog.md` confirmed written
4. `generate_cover` → `Blog/<slug>/cover.png` confirmed written
5. Output contains no self-referential language, workflow references, or meta-commentary

