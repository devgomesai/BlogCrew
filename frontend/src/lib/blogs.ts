import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import { load } from "js-yaml";

// Content sources, in priority order. `content/Blog` is committed inside the
// frontend so posts survive frontend-only deployments (e.g. Vercel);
// `../backend/Blog` holds posts the crew generates during local runs.
const CONTENT_DIRS = [
  join(process.cwd(), "content", "Blog"),
  join(process.cwd(), "..", "backend", "Blog"),
];

const BLOG_DIR = CONTENT_DIRS[0];

// Mirrors SLUG_RE in backend/src/tools.py. Guards every path built from a URL
// segment — without it `..%2f..%2f` escapes BLOG_DIR.
const SLUG_RE = /^[a-zA-Z0-9_-]+$/;

const IMAGE_RE = /\.(png|jpg|jpeg|webp)$/i;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export type BlogMeta = {
  slug: string;
  title: string;
  date: string | null;
  description: string | null;
  tags: string[];
  hasImage: boolean;
  imageName: string | null;
  imagePath: string | null;
};

export type BlogContent = BlogMeta & {
  markdown: string;
};

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function findFirstImage(
  slugDir: string
): { imageName: string; imagePath: string } | null {
  const entries = readdirSync(slugDir);
  const imageFile = entries.find((f) => IMAGE_RE.test(f));
  if (!imageFile) return null;
  return { imageName: imageFile, imagePath: join(slugDir, imageFile) };
}

type Frontmatter = {
  title?: string;
  date?: string;
  description?: string;
  tags?: string[];
};

/**
 * js-yaml parses an unquoted `date: 2025-01-15` into a JS Date object, which
 * crashes React when rendered and has no localeCompare for sorting. Coerce
 * whatever came out of the YAML into the YYYY-MM-DD string the UI expects.
 */
function normalizeDate(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

/** Split YAML frontmatter off the body. Posts without it still work. */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { data: {}, body: raw };
  try {
    const data = (load(match[1]) ?? {}) as Frontmatter;
    return { data, body: raw.slice(match[0].length) };
  } catch {
    // ponytail: malformed frontmatter renders as-is rather than 404ing the post
    return { data: {}, body: raw };
  }
}

function read(slug: string): BlogContent | null {
  if (!SLUG_RE.test(slug)) return null;
  for (const dir of CONTENT_DIRS) {
    const content = readFromDir(dir, slug);
    if (content) return content;
  }
  return null;
}

function readFromDir(dir: string, slug: string): BlogContent | null {
  const slugDir = join(dir, slug);
  const blogPath = join(slugDir, "Blog.md");
  if (!existsSync(blogPath)) return null;

  const { data, body } = parseFrontmatter(readFileSync(blogPath, "utf-8"));
  const image = findFirstImage(slugDir);

  return {
    slug,
    title:
      data.title || body.match(/^#\s+(.+)/m)?.[1].trim() || slugToTitle(slug),
    // No frontmatter date on older posts — file mtime beats sorting by slug.
    date: normalizeDate(data.date) ?? statSync(blogPath).mtime.toISOString().slice(0, 10),
    description: data.description ?? null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    hasImage: !!image,
    imageName: image?.imageName ?? null,
    imagePath: image?.imagePath ?? null,
    markdown: body,
  };
}

export function getAllBlogs(): BlogMeta[] {
  const bySlug = new Map<string, BlogMeta>();
  for (const dir of CONTENT_DIRS) {
    if (!existsSync(dir)) continue;
    for (const slug of readdirSync(dir)) {
      if (bySlug.has(slug)) continue; // committed content wins over backend copies
      try {
        const blog = readFromDir(dir, slug);
        if (blog) bySlug.set(slug, blog);
      } catch {
        // unreadable slug dir — skip rather than break the whole list
      }
    }
  }
  return [...bySlug.values()].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? "")
  );
}

export function getBlog(slug: string): BlogContent | null {
  try {
    return read(slug);
  } catch {
    return null;
  }
}

export { BLOG_DIR };
