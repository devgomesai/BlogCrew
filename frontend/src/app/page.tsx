import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { BlogGlimpse } from "@/app/components/BlogGlimpse";
import { ThemeToggleButton } from "@/app/components/ThemeToggleButton";
import { Brain, Search, PenLine, CheckSquare, Image } from "lucide-react";
import "./landing.css";

export default function HomePage() {
  return (
    <div className="landing-shell">
      <div className="landing-topbar">
        <Link href="/" className="landing-topbar__mark">
          <Logo height={28} />
        </Link>
        <nav className="landing-topbar__nav">
          <Link href="/workshop" className="landing-topbar__link">Workshop</Link>
          <Link href="/blogs" className="landing-topbar__link">Blogs</Link>
          <ThemeToggleButton />
        </nav>
      </div>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__inner">
            <p className="landing-kicker">A Multi-Agent Press</p>
            <h1 className="landing-hero__title">
              Your blog post,<br />
              <span className="landing-hero__accent">from idea to publication.</span>
            </h1>
            <p className="landing-hero__sub">
              BlogCrew is an autonomous editorial pipeline — a crew of AI agents
              that research, write, edit, illustrate, and publish complete blog
              posts. One topic in. A polished article out.
            </p>
            <div className="landing-hero__actions">
              <Link href="/workshop" className="landing-btn landing-btn--primary">
                <span>Create Blog</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/blogs" className="landing-btn landing-btn--secondary">
                <span>Browse Published</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-pipeline">
          <div className="landing-pipeline__inner">
            <h2 className="landing-section-title">The Crew</h2>
            <p className="landing-section-sub">Five specialised agents working in sequence to produce every article.</p>
            <div className="landing-pipeline__grid">
              <div className="landing-agent-card">
                <div className="landing-agent-card__icon" style={{ background: "hsl(15, 52%, 58%)" }}>
                  <Brain className="landing-agent-card__icon-svg" />
                </div>
                <div className="landing-agent-card__dot" style={{ background: "hsl(15, 52%, 58%)" }} />
                <h3>Planner</h3>
                <p>Researches the topic, outlines the structure, and briefs the team on scope and angle.</p>
              </div>
              <div className="landing-agent-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="landing-agent-card">
                <div className="landing-agent-card__icon" style={{ background: "hsl(200, 70%, 50%)" }}>
                  <Search className="landing-agent-card__icon-svg" />
                </div>
                <div className="landing-agent-card__dot" style={{ background: "hsl(200, 70%, 50%)" }} />
                <h3>Researcher</h3>
                <p>Searches the web for sources, data, and context. Gathers evidence and supporting material.</p>
              </div>
              <div className="landing-agent-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="landing-agent-card">
                <div className="landing-agent-card__icon" style={{ background: "hsl(140, 50%, 45%)" }}>
                  <PenLine className="landing-agent-card__icon-svg" />
                </div>
                <div className="landing-agent-card__dot" style={{ background: "hsl(140, 50%, 45%)" }} />
                <h3>Writer</h3>
                <p>Drafts the full article with structure, voice, and SEO. Produces the raw manuscript.</p>
              </div>
              <div className="landing-agent-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="landing-agent-card">
                <div className="landing-agent-card__icon" style={{ background: "hsl(270, 60%, 55%)" }}>
                  <CheckSquare className="landing-agent-card__icon-svg" />
                </div>
                <div className="landing-agent-card__dot" style={{ background: "hsl(270, 60%, 55%)" }} />
                <h3>Editor</h3>
                <p>Reviews, fact-checks, tightens prose, and ensures every post meets publication standards.</p>
              </div>
              <div className="landing-agent-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="landing-agent-card">
                <div className="landing-agent-card__icon" style={{ background: "hsl(30, 80%, 55%)" }}>
                  <Image className="landing-agent-card__icon-svg" />
                </div>
                <div className="landing-agent-card__dot" style={{ background: "hsl(30, 80%, 55%)" }} />
                <h3>Illustrator</h3>
                <p>Generates a cover image using AI, giving every article a unique, publish-ready visual.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta__inner">
            <h2 className="landing-cta__title">Ready to publish?</h2>
            <p className="landing-cta__sub">
              Give the crew a topic and watch your next article come to life.
            </p>
            <BlogGlimpse />
            <Link href="/workshop" className="landing-btn landing-btn--primary landing-btn--large">
              <span>Start Writing</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <span>BlogCrew · A Multi-Agent Press</span>
          <Link href="/blogs" className="landing-footer__link">Published Articles</Link>
        </div>
      </footer>
    </div>
  );
}
