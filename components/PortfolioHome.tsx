"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { SignScene } from "./SignScene";
import { HomeTargetId, sections } from "@/lib/sections";

const cloudTitle = "PORTFOLIO".split("");

export function PortfolioHome() {
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const rotationTarget = useRef(0);
  const rotationCurrent = useRef(0);
  const dragVelocity = useRef(0);
  const didDrag = useRef(false);
  const pointerStart = useRef<{ x: number; lastX: number } | null>(null);
  const [activeId, setActiveId] = useState<HomeTargetId | null>(null);
  const [focusId, setFocusId] = useState<HomeTargetId | null>(null);
  const activeSection = sections.find((section) => section.id === activeId);
  const activeCaption = activeSection ? `${activeSection.zh} / ${activeSection.en}` : "";

  useLayoutEffect(() => {
    if (!shellRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(shellRef.current, { opacity: 1, duration: reduceMotion ? 0 : 1.1, ease: "power2.out" });
  }, []);

  const selectSection = (id: HomeTargetId) => {
    if (didDrag.current) return;
    if (focusId !== id) {
      rotationTarget.current = rotationCurrent.current;
      dragVelocity.current = 0;
      setFocusId(id);
      setActiveId(id);
      return;
    }

    if (id === "contact") return;

    const section = sections.find((item) => item.id === id)!;
    if (!curtainRef.current) return;
    curtainRef.current.style.background = section.color;
    gsap.to(curtainRef.current, {
      scaleY: 1,
      duration: 0.58,
      delay: 0.08,
      ease: "power3.inOut",
      onComplete: () => router.push(section.href),
    });
  };

  const exitFocus = () => {
    if (!focusId) return;
    document.body.style.cursor = "default";
    setFocusId(null);
    setActiveId(null);
  };

  return (
    <main
      className="portfolio-home"
      aria-label="设计作品集首页"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).tagName !== "CANVAS" || focusId) return;
        pointerStart.current = { x: event.clientX, lastX: event.clientX };
        dragVelocity.current = 0;
        didDrag.current = false;
      }}
      onPointerMove={(event) => {
        if (!pointerStart.current || focusId) return;
        const distance = event.clientX - pointerStart.current.x;
        const movement = event.clientX - pointerStart.current.lastX;
        if (Math.abs(distance) > 4) didDrag.current = true;
        rotationTarget.current += movement * 0.0045;
        dragVelocity.current = movement * 0.0045;
        pointerStart.current.lastX = event.clientX;
      }}
      onPointerUp={() => {
        if (!pointerStart.current) return;
        if (didDrag.current) {
          const momentum = Math.max(-0.12, Math.min(0.12, dragVelocity.current));
          rotationTarget.current += momentum * 5;
        }
        pointerStart.current = null;
        window.setTimeout(() => { didDrag.current = false; }, 0);
      }}
      onPointerCancel={() => { pointerStart.current = null; }}
    >
      <div className="home-sky" aria-hidden="true">
        <div className="home-sky-haze home-sky-haze-a" />
        <div className="home-sky-haze home-sky-haze-b" />
        <div className="home-cloud-title">
          {cloudTitle.map((letter, index) => (
            <span key={`${letter}-${index}`} data-letter={letter}>
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div ref={shellRef} className="scene-shell">
        <Suspense fallback={<div className="loading-state">Loading spatial index</div>}>
          <SignScene
            activeId={activeId}
            focusId={focusId}
            rotationTarget={rotationTarget}
            rotationCurrent={rotationCurrent}
            didDrag={didDrag}
            onActive={(id) => { if (!focusId && !didDrag.current) setActiveId(id); }}
            onSelect={selectSection}
            onExitFocus={exitFocus}
          />
        </Suspense>
      </div>

      <p className="gesture-hint">
        {focusId === "contact"
          ? "Click blank to exit"
          : focusId
            ? "Click again to enter · Click blank to exit"
            : "Drag to rotate · Select a sign"}
      </p>
      <div className={`active-caption ${activeCaption ? "is-visible" : ""}`} aria-live="polite">
        {activeCaption}
      </div>

      <nav className="keyboard-nav" aria-label="作品集版块">
        {sections.map((section) => <Link key={section.id} href={section.href}>{section.zh}</Link>)}
        <button type="button" onClick={() => selectSection("contact")}>联系方式</button>
      </nav>

      <div ref={curtainRef} className="transition-curtain" aria-hidden="true" />
    </main>
  );
}
