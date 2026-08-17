"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type BrandProject = {
  id: string;
  title: string;
  subtitle: string;
  subtitleZh: string;
  sign: string;
  color: string;
  assetDir: string;
  images: string[];
  description: string[];
  descriptionZh: string[];
};

const projects: BrandProject[] = [
  {
    id: "verge",
    title: "Verge",
    subtitle: "Visual identity / 2024",
    subtitleZh: "视觉识别 / 2024",
    sign: "/brand/sign-1.png",
    color: "#d4d5d1",
    assetDir: "verge",
    images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
    description: [
      "Verge is a visual identity study built around the quiet tension between structure and movement.",
      "The system uses a restrained wordmark, generous space and a small set of sharp graphic gestures to make each application feel related without becoming repetitive.",
      "This page is a first content pass. Project notes, process images and final specifications can be added here as the case study develops.",
    ],
    descriptionZh: [
      "Verge 是一项围绕“结构与移动之间的安静张力”展开的视觉识别练习。它不试图用强烈的姿态抢占视线，而是在清晰秩序里保留细微的变化。",
      "系统从克制的字标、充足的留白和少量锐利的图形动作出发，让不同媒介中的应用彼此关联，同时保持各自的呼吸感。",
      "这里暂时放入示例文案。后续可以补充项目背景、设计过程、印刷细节与最终应用，让它成为完整的项目档案。",
    ],
  },
  {
    id: "margin",
    title: "Margin Notes",
    subtitle: "Editorial identity / Selected work",
    subtitleZh: "编辑识别 / 精选项目",
    sign: "/brand/sign-2.png",
    color: "#d5d6d2",
    assetDir: "margin",
    images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
    description: [
      "Margin Notes is a placeholder case study for the second brand direction.",
      "The visual language will be developed from the sign artwork, with room for printed matter, editorial systems and campaign applications.",
      "More images and a final project statement will be added in the next content pass.",
    ],
    descriptionZh: [
      "Margin Notes 是第二个品牌方向的示例项目。它从书页边缘的批注感出发，尝试让阅读、记录和个人判断在同一个视觉系统里并置。",
      "版式以安静的网格作为骨架，再以局部的手写感、裁切和密度变化制造节奏；它可以延展到出版物、海报与系列活动物料。",
      "当前文字用于展示页面结构。正式案例完成后，可在这里加入委托背景、视觉策略与各阶段的设计决策。",
    ],
  },
  {
    id: "studio",
    title: "be studio",
    subtitle: "Independent identity / Selected work",
    subtitleZh: "独立工作室识别 / 精选项目",
    sign: "/brand/sign-3.png",
    color: "#d5d6d2",
    assetDir: "studio",
    images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"],
    description: [
      "be studio is a placeholder case study for the third brand direction.",
      "The identity is treated as a flexible mark: warm, tactile and able to move between a quiet studio space and a more expressive public touchpoint.",
      "Project context, outcomes and supporting images can be replaced here when the final case study is ready.",
    ],
    descriptionZh: [
      "be studio 是一个偏温暖、具触感的工作室身份设想。视觉语言在安静的制作现场与更开放的公共表达之间来回切换。",
      "标识被视为一套可伸缩的工具：它可以在小尺寸上保持亲近，也能在更大尺度的展览、海报和物件上变得更加有力。",
      "这部分仍为示例内容。未来可替换为真实合作背景、成果说明和更多与项目相关的文字材料。",
    ],
  },
];

export function BrandDesignPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const chineseRef = useRef<HTMLDivElement>(null);
  const englishRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const active = activeId ? projects.find((project) => project.id === activeId) ?? null : null;

  const scrollPanels = () => [imageRef.current, chineseRef.current, englishRef.current].filter(
    (panel): panel is HTMLDivElement => panel !== null,
  );

  const syncScroll = (nextProgress: number) => {
    const next = Math.max(0, Math.min(1, nextProgress));
    progress.current = next;
    scrollPanels().forEach((panel) => {
      panel.scrollTop = next * Math.max(0, panel.scrollHeight - panel.clientHeight);
    });
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const panels = scrollPanels();
      if (panels.length !== 3) return;
      const longest = Math.max(...panels.map((panel) => Math.max(1, panel.scrollHeight - panel.clientHeight)));
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
      scrollPanels().forEach((panel) => { panel.scrollTop = 0; });
      requestAnimationFrame(() => setTransitioning(false));
    }, 220);
  };

  return (
    <main className="brand-page" style={{ "--brand-accent": active?.color ?? "#d5d6d2" } as React.CSSProperties}>
      <Link className="brand-back" href="/" aria-label="返回路牌首页">← Index</Link>

      <header className="brand-sign-rail" aria-label="品牌设计项目导航">
        <div className="brand-rail-shadow" />
        <div className="brand-rail" />
        <div className="brand-sign-list">
          {projects.map((project) => (
            <div className="brand-sign-mount" key={project.id}>
              <span className="brand-sign-arm" />
              <span className="brand-sign-collar" aria-hidden="true" />
              <button
                type="button"
                className={`brand-sign-button ${project.id === activeId ? "is-active" : ""}`}
                aria-pressed={project.id === activeId}
                onClick={() => selectProject(project.id)}
              >
                <img src={project.sign} alt={`${project.title} 项目路牌`} />
              </button>
            </div>
          ))}
        </div>
      </header>

      <section className={`brand-content ${!active ? "is-empty" : ""} ${transitioning ? "is-transitioning" : ""}`} aria-live="polite">
        {active ? (
          <>
            <div className="brand-panel brand-image-panel">
              <div className="brand-panel-scroll brand-image-scroll" ref={imageRef}>
                <div className="brand-image-stack">
                  {active.images.map((image, index) => (
                    <img
                      key={`${active.id}-${image}`}
                      src={`/brand/${active.assetDir}/${image}`}
                      alt={`${active.title} 项目图 ${index + 1}`}
                      draggable="false"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="brand-panel brand-copy-panel">
              <div className="brand-panel-scroll brand-copy-scroll brand-copy-scroll-zh" ref={chineseRef} lang="zh-CN">
                <div className="brand-copy-inner brand-copy-inner-zh">
                  <p className="brand-kicker">品牌设计 / {active.id}</p>
                  <h1>{active.title}</h1>
                  <p className="brand-subtitle">{active.subtitleZh}</p>
                  <div className="brand-copy-rule" />
                  {active.descriptionZh.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <p className="brand-scroll-note">滚动浏览 · 01—06</p>
                </div>
              </div>
              <div className="brand-panel-scroll brand-copy-scroll brand-copy-scroll-en" ref={englishRef} lang="en">
                <div className="brand-copy-inner">
                  <p className="brand-kicker">Brand design / {active.id}</p>
                  <h1>{active.title}</h1>
                  <p className="brand-subtitle">{active.subtitle}</p>
                  <div className="brand-copy-rule" />
                  {active.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <p className="brand-scroll-note">Scroll to explore · 01—06</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {active ? <p className="brand-footer-note">Selected identity studies · 2024—25</p> : null}
    </main>
  );
}
