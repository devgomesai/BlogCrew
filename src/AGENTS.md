# [AGENTS.md](http://AGENTS.md)

This file is the instruction manual for how blog posts get built. Every agent, every step, every rule lives here. When things change, this document changes. If a user says something different, the user wins. Assume paths don't exist until you've checked them.

---

## Goal

Produce a blog post that reads like a person wrote it. Everything below serves that one aim.

**Input:** Topic
**Output:** `/Blog/<slug>/Blog.md` + `/Blog/<slug>/cover.png`

---

## Startup (always first)

```bash
ls -la                                        # working directory
ls /skills/ && ls /memory/                    # confirm paths
cat /memory/AGENTS.md
cat /skills/blog-writer/SKILL.md
cat /skills/blog-writer/references/
```

---



## Pipeline

Five steps, strictly in order. Track each with `write_todos` and mark all completed before returning.

**1. Plan** — `planner-agent`
Topic + skill context → H2/H3 outline, slug, category, readTime estimate, sections needing research.

**2. Research** — `researcher-agent`
Group 2–3 related sections per call (max 6 calls, max 3 in parallel). Returns raw notes only: `fact | source URL | relevance`. Never search yourself.

**3. Write** — `writer-agent`, one call
The writer first reads `/skills/blog-writer/SKILL.md` in full, then writes based on them — voice, tone, structure, and template all come from the skill, not from defaults. Input: full outline + all research + skill context → complete draft in a single pass. Second person, confident and advisory, inline numbered citations matching a Sources section. Never write prose yourself. If a gap surfaces, one extra research or write call — then move on.

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

**Finalize** — write `Blog/<slug>/Blog.md` (the humanized draft) and generate `Blog/<slug>/cover.png`. Both files, always.

---



## Final checklist (hard gate)

1. All todos completed
2. Metadata validated by the editor
3. Humanizer ran last; its output is what's saved
4. Zero em dashes remain
5. Both output files written
6. No self-referential language, workflow references, or meta-commentary in the post

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


