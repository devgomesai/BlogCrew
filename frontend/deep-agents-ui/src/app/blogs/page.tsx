import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getAllBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export default function BlogsPage() {
  const blogs = getAllBlogs();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Link>
        <div className="h-5 w-px bg-[var(--color-border)]" />
        <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
        <h1 className="text-lg font-semibold">Published Blogs</h1>
        <span className="text-sm text-[var(--color-text-tertiary)]">
          {blogs.length} post{blogs.length !== 1 ? "s" : ""}
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <BookOpen className="h-12 w-12 text-[var(--color-text-tertiary)]" />
            <p className="text-lg text-[var(--color-text-secondary)]">No blog posts yet</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Generate a blog post from the chat interface to see it here.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Go to Chat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:border-[var(--color-primary)] hover:shadow-lg"
              >
                {blog.hasImage ? (
                  <div className="aspect-[2/1] overflow-hidden bg-[var(--color-background)]">
                    <img
                      src={`/api/blogs/${blog.slug}/image`}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[2/1] items-center justify-center bg-[var(--color-background)]">
                    <BookOpen className="h-10 w-10 text-[var(--color-text-tertiary)]" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                    {blog.title}
                  </h2>
                  <p className="mt-auto pt-3 text-xs text-[var(--color-text-tertiary)]">
                    Read more →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
