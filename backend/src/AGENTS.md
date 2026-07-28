# [AGENTS.md](http://AGENTS.md)

This file is the instruction manual for how blog posts get built. Every agent, every step, every rule lives here. When things change, this document changes. If a user says something different, the user wins. Assume paths don't exist until you've checked them.

---

## Goal

Produce a blog post that reads like a person wrote it. Everything below serves that one aim.

**Input:** Topic
**Output:** `/Blog/<slug>/Blog.md` + `/Blog/<slug>/cover.png`

---

## Communication style

Lead every update with the outcome, not the process. Give a brief update only when you find something important or change direction. Do not narrate routine tool calls — just make them. When you finish a pipeline run, say in one sentence what happened, then move on.

## Scope

Deliver what was asked at the scope intended. If the request seems mistaken or a better approach exists, say so in a sentence and continue — don't quietly narrow, widen, or transform the task. If a gap surfaces during the pipeline, one extra research or write call, then move on.

---



## Sandbox workspace

All research files go inside `/memory/sandbox/<blog-slug>/`. Before anything else, create and cd into its dedicated folder `/memory/sandbox/<blog-slug>/`. Only research files are stored here — no plan, draft, or edited files. The final output goes to `Blog/<slug>/Blog.md` and `Blog/<slug>/cover.png`.

```bash
mkdir -p /memory/sandbox/<blog-slug> && cd /memory/sandbox/<blog-slug>
ls -la                                            # verify empty
```



## Startup (always first)

```bash
pwd                                             # must be /memory/sandbox/<blog-slug>
ls -la                                          # working directory
ls /skills/ && ls /memory/                      # confirm paths
cat /memory/AGENTS.md
cat /skills/blog-writer/SKILL.md
cat /skills/blog-writer/references/
```

---



## Pipeline

Five steps, strictly in order. Track each with `write_todos` and mark all completed before returning.

**1. Plan** — `planner-agent`
Topic + skill context → H2/H3 outline, slug, category, readTime estimate, sections needing research. Scope the outline so the final post lands between 800 and 1,200 words.

**2. Research** — `researcher-agent`
Group 2–3 related sections per call (max 6 calls, max 3 in parallel). Returns raw notes only: `fact | source URL | relevance`. Saves all research notes inside `/memory/sandbox/<blog-slug>/research_<n>.md`. Never search yourself.

**3. Write** — `writer-agent`, one call
The writer first reads `/skills/blog-writer/SKILL.md` in full, then writes based on them — voice, tone, structure, and template all come from the skill, not from defaults. Input: full outline + all research + skill context → complete draft in a single pass. **Word count: 800–1,200 words — hard constraint, no exceptions.** Second person, confident and advisory, inline numbered citations matching a Sources section. **Sources section: top 5 most relevant sources only, not every source gathered during research.** Never write prose yourself. If a gap surfaces, one extra research or write call — then move on.

**4. Edit** — `editor-agent`
Polishes clarity, grammar, flow, and SEO. Validates every BlogPost field against the skill context. Does **not** humanize. Returns polished draft + metadata.

**5. Humanize** — `humanizer-agent` *(mandatory, never merged into editing)*
Reads `/skills/humanizer/SKILL.md` and runs its draft → audit → final loop on the whole edited draft. This output is what gets saved.

The humanizer must:

- Vary sentence rhythm hard: fragments and short punches next to long sentences
- Use contractions freely; prefer And/But/So over Moreover/Furthermore
- Kill every AI tell — inflated symbolism, rule of three, AI vocabulary (delve, robust, tapestry…), signposting, hedged filler, promotional tone, positive-cliché endings
- **Zero em dashes** (`—` or `–`) in the output — no exceptions
- Add natural voice: opinions, thinking markers, first person where it fits
- Rewrite, never delete — same sections, same facts, same sources, same length, metadata untouched
- Never touch the YAML frontmatter block — copy it through verbatim

**Finalize** — write `Blog/<slug>/Blog.md` (the humanized draft) and generate `Blog/<slug>/cover.png`. Both files, always.

`Blog.md` must begin with YAML frontmatter — the site reads it for the page
title, meta description, OG tags, and post ordering. Without it the post
falls back to guessing from the H1 and the file's mtime:

```yaml
---
title: "The post title"
date: YYYY-MM-DD
description: "One sentence, under 160 characters."
tags: [tag-one, tag-two, tag-three]
---
```

---



## Deliverable constraints

- Humanizer output is what gets saved
- Zero em dashes in the final post
- Both `Blog/<slug>/Blog.md` and `Blog/<slug>/cover.png` written
- No self-referential language, workflow references, or meta-commentary in the post
- Final word count between 800 and 1,200

---



## Priority on conflict

User prompt → skill files → this document. Note any conflict at finalize and fix it here.

## Self-improvement

Save a learning only if it would apply to a different topic in a new conversation.


| Learning                  | Save to                           |
| ------------------------- | --------------------------------- |
| Workflow / delegation     | `/memory/AGENTS.md`               |
| Writing, structure, SEO   | `/skills/blog-writer/SKILL.md`    |
| Humanization fixes        | `/skills/humanizer/SKILL.md`      |
| Templates, voice examples | `/skills/blog-writer/references/` |


