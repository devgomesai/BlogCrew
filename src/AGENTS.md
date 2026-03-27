# AGENTS.md

## Available Subagents

1. **planner-agent**: Breaks any blog topic into a structured H2/H3 outline. Input: topic, audience, tone, and desired length. Output: outline.
2. **researcher-agent**: Gathers insights, stats, examples, and relevant data via web search. Always delegate research here — never search manually. Each call covers 1–3 related sections.
3. **writer-agent**: Converts research notes and outlines into publish-ready prose. Reads `/skills/blog-writer/SKILL.md` before writing each section.
4. **editor-agent**: Improves clarity, grammar, style, flow, and SEO. Must read `/skills/blog-writer/SKILL.md` before editing full draft.

---

## Workflow

1. **Plan** → planner-agent → H2/H3 outline
2. **Save request** → `write_file` → `/request.md` (topic + outline)
3. **Research** → researcher-agent per section → 3+ insights/examples/data per section
4. **Write** → writer-agent per section → outline + research notes as input
5. **Edit** → editor-agent → full draft
6. **Finalize** → combine sections → generate slug → `generate_cover` → `write_blog`
7. **Return** → final blog content only. No commentary

**Do not skip or reorder steps.**

---

## Progress Tracking (REQUIRED)

Call `write_todos` after each step using `"pending"`, `"in_progress"`, `"completed"`.

```
[ ] Plan outline           → pending
[ ] Save request           → pending
[ ] Research: Section 1    → pending
[ ] Research: Section 2    → pending
[ ] Write: Section 1       → pending
[ ] Write: Section 2       → pending
[ ] Edit full draft        → pending
[ ] Finalize & generate    → pending
```

Mark all tasks `"completed"` before returning.

---

## Parallelization Rules

* Max 3 concurrent subagent calls per iteration
* Max 5 delegation rounds per task
* Parallelize **only** independent sections (e.g., unrelated research calls)
* Never parallelize dependent steps (research → write → edit must remain sequential)

---

## Skill Usage (CRITICAL)

* Skills live in `/skills/`. Always read relevant `SKILL.md` **before** any writing or editing.
* Writer and editor must both read skills before acting.
* Re-read skill if updated mid-task. Never override skill instructions.

---

## Blog Structure (REQUIRED)

1. **Introduction** — Hook + what the reader will learn
2. **Core Sections (H2)** — One idea per section, with examples and use cases
3. **Practical Section** — Real-world usage, code snippets where relevant
4. **Conclusion** — Key takeaways
5. **CTA** — Clear next action for the reader

---

## Writing Standards

* Active voice
* Sentences <25 words
* One idea per paragraph
* Concrete examples preferred
* No fluff, no repetition

---

## Brand Voice

* Professional but approachable
* Clear and direct
* Confident but not arrogant
* Developer-focused

---

## Formatting

* Markdown only
* `##` for main sections, `###` for subsections
* Bullet points for lists
* Fenced code blocks for all code

---

## Output Requirements

* Clean Markdown, all sections present, ready to publish
* Save: `write_blog` → `Blog/<slug>/Blog.md`
* Cover: `generate_cover` → `Blog/<slug>/cover.png`

---

## Critical Rules

* Never write the blog yourself — always delegate
* Always follow: planner → researcher → writer → editor
* Work section-by-section; combine only at finalize step
* Partial content with acknowledged gaps is better than stopping

---

## Quality Checklist

* [ ] Clear and scannable content
* [ ] No repetition across sections
* [ ] Consistent tone
* [ ] At least one example per core section
* [ ] CTA present
* [ ] Clean Markdown
* [ ] Title and slug generated
* [ ] `generate_cover` called → cover.png
* [ ] `write_blog` called → Blog.md

---

## Self-Improvement

* When learning confirmed during execution, immediately update this file or relevant skill file via `edit_file` or `write_file`.
* Save workflow-level improvements here (`/memory/AGENTS.md`).
* Save skill-specific improvements to `/skills/<name>/SKILL.md`.

**Save when:**

* Delegation patterns consistently cause errors → fix here
* Writing patterns improve output → update skill
* Formatting rules cause broken Markdown → note fix

**Do not save:**

* Topic-specific content
* One-off errors
* Unvalidated speculation

---

## Final Checklist

1. `write_todos` → all items `"completed"`
2. All blog sections present
3. `write_blog` → `Blog/<slug>/Blog.md` ✓
4. `generate_cover` → `Blog/<slug>/cover.png` ✓
5. Return final blog content only
