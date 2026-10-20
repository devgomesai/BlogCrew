"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Search, PenLine, CheckSquare, Image } from "lucide-react";

export const PHASES = [
  {
    name: "Planner",
    Icon: Brain,
    color: "hsl(15, 52%, 58%)",
    desc:
      "Researches the topic, outlines the structure, and briefs the team on scope and angle.",
  },
  {
    name: "Researcher",
    Icon: Search,
    color: "hsl(200, 70%, 50%)",
    desc:
      "Searches the web for sources, data, and context. Gathers evidence and supporting material.",
  },
  {
    name: "Writer",
    Icon: PenLine,
    color: "hsl(140, 50%, 45%)",
    desc:
      "Drafts the full article with structure, voice, and SEO. Produces the raw manuscript.",
  },
  {
    name: "Editor",
    Icon: CheckSquare,
    color: "hsl(270, 60%, 55%)",
    desc:
      "Reviews, fact-checks, tightens prose, and ensures every post meets publication standards.",
  },
  {
    name: "Humanizer",
    Icon: Image,
    color: "hsl(30, 80%, 55%)",
    desc:
      "Strips the AI tells out of the final draft so it reads like a person wrote it.",
  },
];

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export default function Journey() {
  const [activePhase, setActivePhase] = useState(0);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>(
    PHASES.map(() => null)
  );
  const activeRef = useRef(0);

  const scrollToPhase = (index: number) => {
    phaseRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  useEffect(() => {
    const root = document.querySelector(".landing-shell");
    if (!root) return;

    let frame = 0;

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const center = rootRect.top + rootRect.height / 2;
      let bestIdx = 0;
      let bestProgress = -1;

      phaseRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - center);
        const progress = smoothstep(1 - dist / (rootRect.height * 0.62));
        el.style.setProperty("--progress", progress.toFixed(3));
        if (progress > bestProgress) {
          bestProgress = progress;
          bestIdx = idx;
        }
      });

      if (bestIdx !== activeRef.current) {
        activeRef.current = bestIdx;
        setActivePhase(bestIdx);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      className="landing-journey"
      aria-label="Blog generation phases"
    >
      {PHASES.map((phase, idx) => (
        <div
          key={phase.name}
          ref={(el) => {
            phaseRefs.current[idx] = el;
          }}
          data-phase={phase.name}
          className="landing-phase"
        >
          <article className="landing-phase__card">
            <div className="landing-phase__identity">
              <div
                className="landing-phase__icon"
                style={{ background: phase.color }}
              >
                <phase.Icon className="landing-phase__icon-svg" />
              </div>
              <h2 className="landing-phase__name">{phase.name}</h2>
            </div>
            <p className="landing-phase__desc">{phase.desc}</p>
          </article>
        </div>
      ))}
      <nav
        className="landing-journey__nav"
        aria-label="Phase navigation"
      >
        {PHASES.map((phase, idx) => (
          <button
            key={phase.name}
            type="button"
            aria-label={`Go to ${phase.name}`}
            aria-current={activePhase === idx ? "step" : undefined}
            onClick={() => scrollToPhase(idx)}
            className={`landing-journey__dot ${
              activePhase === idx ? "landing-journey__dot--active" : ""
            }`}
          />
        ))}
      </nav>
    </section>
  );
}
