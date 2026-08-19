"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

export function AboutPage() {
  const [sceneRotation, setSceneRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, rotation: 0 });

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, rotation: sceneRotation };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nextRotation = dragStart.current.rotation + (event.clientX - dragStart.current.x) * 0.35;
    setSceneRotation(Math.max(-95, Math.min(95, nextRotation)));
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const sceneStyle = { "--scene-rotation": `${sceneRotation}deg` } as CSSProperties;

  return (
    <main className="about-svg-page">
      <Link className="brand-back about-svg-back" href="/" aria-label="返回路牌首页">
        ← Index
      </Link>

      <div className="about-svg-canvas">
        <img
          className="about-svg-artwork"
          src="/about/about-page-text.svg"
          alt="Gemini Kong 关于我页面文字排版"
        />

        <div
          className={`about-svg-installation${isDragging ? " is-dragging" : ""}`}
          style={sceneStyle}
          aria-label="个人照片路牌装置，可左右拖动旋转"
          role="img"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <div className="about-svg-scene">
            <span className="about-svg-pole" aria-hidden="true" />
            <span className="about-svg-photo-arm" aria-hidden="true" />

            <div className="about-svg-photo">
              <img src="/about/photo.png" alt="Gemini Kong 个人照片" />
            </div>
            <div className="about-svg-collars" aria-hidden="true">
              <span className="about-svg-collar about-svg-collar-1" />
              <span className="about-svg-collar about-svg-collar-2" />
              <span className="about-svg-collar about-svg-collar-3" />
              <span className="about-svg-collar about-svg-collar-4" />
              <span className="about-svg-collar about-svg-collar-5" />
            </div>

            <img className="about-svg-cone" src="/about/traffic-cone-front.png" alt="橙白相间的正面交通路障" />
          </div>
        </div>
      </div>
    </main>
  );
}
