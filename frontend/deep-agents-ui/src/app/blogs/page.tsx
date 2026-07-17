import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";
import { ThemeToggle } from "./ThemeToggle";

export const dynamic = "force-dynamic";

export default function BlogsPage() {
  const blogs = getAllBlogs();
  const issue = new Date()
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  if (blogs.length === 0) {
    return (
      <>
        <Topbar />
        <div className="blog-empty">
          <p className="blog-kicker">Nothing in print — yet</p>
          <h2>The presses are quiet.</h2>
          <p>
            No posts have been published. Send the crew a topic from the
            workshop and the first edition will land right here.
          </p>
          <Link href="/" className="blog-btn">
            Open the Workshop
          </Link>
        </div>
      </>
    );
  }

  const [lead, ...rest] = blogs;

  return (
    <>
      <Topbar />

      <header className="blog-masthead">
        <div className="blog-masthead__inner">
          <p className="blog-kicker">A multi-agent publication</p>
          <h1 className="blog-masthead__title">
            The <em>Press</em>
          </h1>
          <p className="blog-masthead__sub">
            Researched, written, edited and illustrated end-to-end by the
            BlogCrew agents.
          </p>
          <div className="blog-masthead__meta">
            <span>Issue · {issue}</span>
            <span>
              {blogs.length} Article{blogs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="blog-index">
        <Link href={`/blogs/${lead.slug}`} className="blog-lead">
          <div className="blog-lead__media">
            {lead.hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/blogs/${lead.slug}/image`} alt={lead.title} className="bauhaus-img" />
            ) : (
              <Glyph />
            )}
          </div>
          <div className="blog-lead__body">
            <p className="blog-kicker">Lead Story · No. 01</p>
            <h2 className="blog-lead__title">{lead.title}</h2>
            <span className="blog-lead__readmore">
              <span className="bar" /> Read the feature
            </span>
          </div>
        </Link>

        {rest.length > 0 && (
          <>
            <div className="blog-section-label">
              <span className="blog-kicker">More from this issue</span>
            </div>

            <section className="blog-grid">
              {rest.map((blog, i) => (
                <Link
                  key={blog.slug}
                  href={`/blogs/${blog.slug}`}
                  className="blog-card"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="blog-card__index">
                    <span>No. {String(i + 2).padStart(2, "0")}</span>
                    <span>{blog.hasImage ? "ILLUSTRATED" : "TEXT"}</span>
                  </div>
                  <div
                    className={`blog-card__media${
                      blog.hasImage ? "" : " blog-card__media--empty"
                    }`}
                  >
                    {blog.hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/blogs/${blog.slug}/image`}
                        alt={blog.title}
                      />
                    ) : (
                      <Glyph />
                    )}
                  </div>
                  <h3 className="blog-card__title">{blog.title}</h3>
                  <span className="blog-card__cta">Read →</span>
                </Link>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function Topbar() {
  return (
    <div className="blog-topbar">
      <Link href="/" className="blog-link-back">
        ← The Workshop
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span className="blog-topbar__mark">BlogCrew</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

function Glyph() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="44"
      height="44"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="24" cy="14" r="8" />
      <rect x="14" y="28" width="20" height="20" />
      <polygon points="24,52 10,32 38,32" />
    </svg>
  );
}
