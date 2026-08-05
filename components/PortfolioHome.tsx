"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ContactStub } from "./ContactStub";
import { SignScene } from "./SignScene";
import { sections, SectionId } from "@/lib/sections";

export function PortfolioHome() {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const rotationTarget = useRef(0);
  const didDrag = useRef(false);
  const pointerStart = useRef<{ x: number; rotation: number } | null>(null);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [focusId, setFocusId] = useState<SectionId | null>(null);
  const activeSection = sections.find((section) => section.id === activeId);

  useLayoutEffect(() => {
    if (!shellRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(shellRef.current, { opacity: 1, duration: reduceMotion ? 0 : 1.1, ease: "power2.out" });
  }, []);

  const selectSection = (id: SectionId) => {
    if (focusId || didDrag.current) return;
    const section = sections.find((item) => item.id === id)!;
    setFocusId(id);
    setActiveId(id);
    if (!curtainRef.current) return;
    curtainRef.current.style.background = section.color;
    gsap.to(curtainRef.current, {
      scaleY: 1,
      duration: 0.58,
      delay: 0.52,
      ease: "power3.inOut",
      onComplete: () => router.push(section.href),
    });
  };

  return (
    <main
      className="portfolio-home"
      aria-label="设计作品集首页"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).tagName !== "CANVAS" || focusId) return;
        pointerStart.current = { x: event.clientX, rotation: rotationTarget.current };
        didDrag.current = false;
      }}
      onPointerMove={(event) => {
        if (!pointerStart.current || focusId) return;
        const distance = event.clientX - pointerStart.current.x;
        if (Math.abs(distance) > 4) didDrag.current = true;
        rotationTarget.current = pointerStart.current.rotation + distance * 0.006;
      }}
      onPointerUp={() => {
        if (!pointerStart.current) return;
        const step = (Math.PI * 2) / 5;
        if (didDrag.current) rotationTarget.current = Math.round(rotationTarget.current / step) * step;
        pointerStart.current = null;
        window.setTimeout(() => { didDrag.current = false; }, 0);
      }}
      onPointerCancel={() => { pointerStart.current = null; }}
    >
      <div ref={shellRef} className="scene-shell">
        <Suspense fallback={<div className="loading-state">Loading spatial index</div>}>
          <SignScene
            activeId={activeId}
            focusId={focusId}
            rotationTarget={rotationTarget}
            didDrag={didDrag}
            onActive={(id) => { if (!focusId && !didDrag.current) setActiveId(id); }}
            onSelect={selectSection}
          />
        </Suspense>
      </div>

      <p className="gesture-hint">Drag to rotate · Select a sign</p>
      <div className={`active-caption ${activeSection ? "is-visible" : ""}`} aria-live="polite">
        {activeSection ? `${activeSection.zh} / ${activeSection.en}` : ""}
      </div>

      <nav className="keyboard-nav" aria-label="作品集版块">
        {sections.map((section) => <Link key={section.id} href={section.href}>{section.zh}</Link>)}
      </nav>

      <ContactStub />
      <div ref={curtainRef} className="transition-curtain" aria-hidden="true" />
    </main>
  );
}
