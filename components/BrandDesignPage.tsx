"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type BrandProject = {
  id: string;
  title: string;
  subtitle: string;
  sign: string;
  color: string;
  images: string[];
  description: string[];
};

const projects: BrandProject[] = [
  {
    id: "verge",
    title: "Verge",
    subtitle: "Visual identity / 2024",
    sign: "/brand/sign-1.png",
    color: "#d4d5d1",
    images: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"],
    description: [
      "Verge is a visual identity study built around the quiet tension between structure and movement.",
      "The system uses a restrained wordmark, generous space and a small set of sharp graphic gestures to make each application feel related without becoming repetitive.",
      "This page is a first content pass. Project notes, process images and final specifications can be added here as the case study develops.",
    ],
  },
  {
    id: "margin",
    title: "Margin Notes",
    subtitle: "Editorial identity / Selected work",
    sign: "/brand/sign-2.png",
    color: "#d5d6d2",
    images: ["2.png", "4.png", "6.png"],
    description: [
      "Margin Notes is a placeholder case study for the second brand direction.",
      "The visual language will be developed from the sign artwork, with room for printed matter, editorial systems and campaign applications.",
      "More images and a final project statement will be added in the next content pass.",
    ],
  },
  {
    id: "studio",
    title: "be studio",
    subtitle: "Independent identity / Selected work",
    sign: "/brand/sign-3.png",
    color: "#d5d6d2",
    images: ["3.png", "5.png", "1.png"],
    description: [
      "be studio is a placeholder case study for the third brand direction.",
      "The identity is treated as a flexible mark: warm, tactile and able to move between a quiet studio space and a more expressive public touchpoint.",
      "Project context, outcomes and supporting images can be replaced here when the final case study is ready.",
    ],
  },
];

export function BrandDesignPage() {
  const [activeId, setActiveId] = useState(projects[0].id);
  const [transitioning, setTransitioning] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const active = projects.find((project) => project.id === activeId)!;

  const syncScroll = (nextProgress: number) => {
    const next = Math.max(0, Math.min(1, nextProgress));
    progress.current = next;
    const left = leftRef.current;
    const right = rightRef.current;
    if (left) left.scrollTop = next * Math.max(0, left.scrollHeight - left.clientHeight);
    if (right) right.scrollTop = next * Math.max(0, right.scrollHeight - right.clientHeight);
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!leftRef.current || !rightRef.current) return;
      const maxLeft = Math.max(1, leftRef.current.scrollHeight - leftRef.current.clientHeight);
      const maxRight = Math.max(1, rightRef.current.scrollHeight - rightRef.current.clientHeight);
      const longest = Math.max(maxLeft, maxRight);
      event.preventDefault();
      syncScroll(progress.current + event.deltaY / longest);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeId]);

  const selectProject = (id: string) => {
    if (id === activeId) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setActiveId(id);
      progress.current = 0;
      if (leftRef.current) leftRef.current.scrollTop = 0;
      if (rightRef.current) rightRef.current.scrollTop = 0;
      requestAnimationFrame(() => setTransitioning(false));
    }, 220);
  };

  return (
    <main className="brand-page" style={{ "--brand-accent": active.color } as React.CSSProperties}>
      <Link className="brand-back" href="/" aria-label="返回路牌首页">← Index</Link>

      <header className="brand-sign-rail" aria-label="品牌设计项目导航">
        <div className="brand-rail-shadow" />
        <div className="brand-rail" />
        <div className="brand-sign-list">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`brand-sign-button ${project.id === activeId ? "is-active" : ""}`}
              aria-pressed={project.id === activeId}
              onClick={() => selectProject(project.id)}
            >
              <span className="brand-sign-arm" />
              <img src={project.sign} alt={`${project.title} 项目路牌`} />
            </button>
          ))}
        </div>
      </header>

      <section className={`brand-content ${transitioning ? "is-transitioning" : ""}`} aria-live="polite">
        <div className="brand-panel brand-image-panel" ref={leftRef}>
          <div className="brand-image-stack">
            {active.images.map((image, index) => (
              <img
                key={`${active.id}-${image}`}
                src={`/brand/verge/${image}`}
                alt={`${active.title} 项目图 ${index + 1}`}
                draggable="false"
              />
            ))}
          </div>
        </div>
        <div className="brand-panel brand-copy-panel" ref={rightRef}>
          <div className="brand-copy-inner">
            <p className="brand-kicker">Brand design / {active.id}</p>
            <h1>{active.title}</h1>
            <p className="brand-subtitle">{active.subtitle}</p>
            <div className="brand-copy-rule" />
            {active.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className="brand-scroll-note">Scroll to explore · 01—06</p>
          </div>
        </div>
      </section>

      <p className="brand-footer-note">Selected identity studies · 2024—25</p>
    </main>
  );
}
