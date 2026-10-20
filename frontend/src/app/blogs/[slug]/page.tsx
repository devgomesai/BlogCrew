import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlog } from "@/lib/blogs";
import { ThemeToggle } from "../ThemeToggle";
import { Logo } from "@/app/components/Logo";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlog(slug);
  if (!blog) return { title: "Not found" };

  const images = blog.hasImage ? [`/api/blogs/${blog.slug}/image`] : [];
  return {
    title: blog.title,
    description: blog.description ?? undefined,
    keywords: blog.tags.length ? blog.tags : undefined,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.description ?? undefined,
      publishedTime: blog.date ?? undefined,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      images,
    },
  };
}

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
        <Link
          href="/blogs"
          className="blog-link-back"
        >
          ← All Articles
        </Link>
        <div className="blog-topbar__right">
          <Link
            href="/blogs"
            className="blog-topbar__mark"
          >
            <Logo height={56} />
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="blog-article-wrapper">
        <article className="blog-article">
          <header className="blog-article__head">
            <p className="blog-kicker">Feature · Quill</p>
            <h1 className="blog-article__title">{blog.title}</h1>
            <div className="blog-article__meta">
              <span>{minutes} min read</span>
              <span>{words.toLocaleString()} words</span>
              {blog.date && <time dateTime={blog.date}>{blog.date}</time>}
            </div>
            {blog.hasImage && (
              <figure className="blog-article__hero">
                <img
                  src={`/api/blogs/${blog.slug}/image`}
                  alt={blog.title}
                />
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
                    <code
                      className={className}
                      {...props}
                    >
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
      </div>

      <footer className="blog-article__foot">
        <span className="blog-kicker">End of article</span>
        <Link
          href="/blogs"
          className="blog-link-back"
        >
          ← Back to all articles
        </Link>
      </footer>
    </>
  );
}
