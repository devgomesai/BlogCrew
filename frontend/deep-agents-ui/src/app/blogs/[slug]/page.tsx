import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlog } from "@/lib/blogs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-4">
        <Link
          href="/blogs"
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Blogs
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        {blog.hasImage && (
          <div className="mb-8 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <img
              src={`/api/blogs/${blog.slug}/image`}
              alt={blog.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <h1 className="mb-2 text-3xl font-bold leading-tight">{blog.title}</h1>

        <div className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
          <Calendar className="h-4 w-4" />
          <span>{slug}</span>
        </div>

        <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-[var(--color-text-primary)] prose-a:text-[var(--color-primary)] prose-a:underline prose-strong:text-[var(--color-text-primary)] prose-code:text-[var(--color-primary)] prose-code:bg-[var(--color-surface)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[var(--color-surface)] prose-pre:border prose-pre:border-[var(--color-border)] prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-secondary)] prose-li:text-[var(--color-text-primary)] prose-img:rounded-lg prose-hr:border-[var(--color-border)]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {blog.markdown}
          </ReactMarkdown>
        </div>
      </article>

      <footer className="border-t border-[var(--color-border)] px-6 py-6 text-center">
        <Link
          href="/blogs"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ← Back to all blogs
        </Link>
      </footer>
    </div>
  );
}
