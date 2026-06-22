import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const BLOG_DIR = join(process.cwd(), "..", "..", "Blog");

export type BlogMeta = {
  slug: string;
  title: string;
  hasImage: boolean;
  imageName: string | null;
  imagePath: string | null;
};

export type BlogContent = BlogMeta & {
  markdown: string;
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function findFirstImage(slugDir: string): { imageName: string; imagePath: string } | null {
  if (!existsSync(slugDir)) return null;
  const entries = readdirSync(slugDir);
  const imageFile = entries.find((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  if (!imageFile) return null;
  return { imageName: imageFile, imagePath: join(slugDir, imageFile) };
}

function extractTitle(slugDir: string): string | null {
  const blogPath = join(slugDir, "Blog.md");
  if (!existsSync(blogPath)) return null;
  const content = readFileSync(blogPath, "utf-8");
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

export function getAllBlogs(): BlogMeta[] {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter((entry) => {
      const full = join(BLOG_DIR, entry);
      try {
        const files = readdirSync(full);
        return files.some((f) => f.endsWith(".md")) || files.some((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
      } catch {
        return false;
      }
    })
    .map((slug) => {
      const slugDir = join(BLOG_DIR, slug);
      const title = extractTitle(slugDir) || slugToTitle(slug);
      const image = findFirstImage(slugDir);
      return {
        slug,
        title,
        hasImage: !!image,
        imageName: image?.imageName ?? null,
        imagePath: image?.imagePath ?? null,
      };
    })
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getBlog(slug: string): BlogContent | null {
  const slugDir = join(BLOG_DIR, slug);
  if (!existsSync(slugDir)) return null;
  const blogPath = join(slugDir, "Blog.md");
  if (!existsSync(blogPath)) return null;
  const markdown = readFileSync(blogPath, "utf-8");
  const title = extractTitle(slugDir) || slugToTitle(slug);
  const image = findFirstImage(slugDir);
  return {
    slug,
    title,
    hasImage: !!image,
    imageName: image?.imageName ?? null,
    imagePath: image?.imagePath ?? null,
    markdown,
  };
}

export { BLOG_DIR };
