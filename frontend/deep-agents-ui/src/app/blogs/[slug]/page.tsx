import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlog } from "@/lib/blogs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) notFound();

  const words = blog.markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));

  return (
    <>
      <div className="blog-topbar">
        <Link href="/blogs" className="blog-link-back">
          ← All Articles
        </Link>
        <span className="blog-topbar__mark">The Press</span>
      </div>

      <article className="blog-article">
        <header className="blog-article__head">
          <p className="blog-kicker">Feature · BlogCrew</p>
          <div className="blog-article__meta">
            <span>{minutes} min read</span>
            <span>{words.toLocaleString()} words</span>
            <span>{slug}</span>
          </div>
          {blog.hasImage && (
            <figure className="blog-article__hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/blogs/${blog.slug}/image`} alt={blog.title} />
            </figure>
          )}
        </header>

        <div className="blog-prose">
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

      <footer className="blog-article__foot">
        <span className="blog-kicker">End of article</span>
        <Link href="/blogs" className="blog-link-back">
          ← Back to all articles
        </Link>
      </footer>
    </>
  );
}
