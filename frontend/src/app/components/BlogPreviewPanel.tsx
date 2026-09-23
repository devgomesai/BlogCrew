"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import type { BlogMeta } from "@/lib/blogs";

type PreviewBlog = Omit<BlogMeta, "imagePath"> & { markdown: string };

export function BlogPreviewPanel({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const [blog, setBlog] = useState<PreviewBlog | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Changes per opened preview so a regenerated cover isn't served from the
  // image route's year-long browser cache.
  const [version] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    setBlog(null);
    setError(null);
    fetch(`/api/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`The post "${slug}" could not be loaded`);
        return (await res.json()) as PreviewBlog;
      })
      .then((data) => !cancelled && setBlog(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const words = blog?.markdown.trim().split(/\s+/).filter(Boolean).length ?? 0;
  // Posts without frontmatter open with their own heading; don't repeat it.
  const firstHeading = blog?.markdown.match(/^#{1,3}\s+(.+)$/m)?.[1] ?? "";
  const bodyHasTitle = !!blog && firstHeading.trim().startsWith(blog.title);

  return (
    <aside
      className="flex h-full flex-col bg-background"
      aria-label="Generated blog preview"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <span className="text-sm font-medium">Your blog is ready</span>
        <div className="flex items-center gap-1">
          <Link
            href={`/blogs/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Open article
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <p
            role="alert"
            className="m-4 text-sm text-destructive"
          >
            {error}. It may still be on the backend's disk only; check that the
            frontend can read <code>backend/Blog</code>.
          </p>
        )}
        {!blog && !error && (
          <div className="space-y-3 p-4">
            <div className="aspect-video w-full animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        )}
        {blog && (
          <article className="space-y-4 p-4">
            {blog.hasImage && (
              <img
                src={`/api/blogs/${blog.slug}/image?v=${version}`}
                alt={blog.title}
                className="w-full rounded-md border border-border"
              />
            )}
            {!bodyHasTitle && (
              <h1 className="text-xl font-semibold">{blog.title}</h1>
            )}
            <p className="text-xs text-muted-foreground">
              {[
                blog.date,
                `${words.toLocaleString()} words`,
                `${Math.max(1, Math.round(words / 220))} min read`,
                blog.hasImage ? null : "no cover image",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <MarkdownContent content={blog.markdown} />
          </article>
        )}
      </div>
    </aside>
  );
}
