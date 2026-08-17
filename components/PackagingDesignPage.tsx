"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PackagingProject = {
  id: string;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  sign: string;
  assetDir: string;
  images: string[];
  description: string[];
  descriptionZh: string[];
};

const projects: PackagingProject[] = [
  {
    id: "focus",
    title: "Pink Blur",
    titleZh: "失焦",
    subtitle: "Fruit cocktail packaging / 2024",
    subtitleZh: "果味预调酒包装 / 2024",
    sign: "/packaging/sign-1.png",
    assetDir: "focus",
    images: ["1.jpg", "2.jpg", "3.jpg"],
    description: [
      "Pink Blur is a packaging direction for a fruit-led ready-to-drink cocktail. The label begins with a deliberately softened wordmark: a small visual pause before the flavour comes into focus.",
      "Bright pink and orange fields create a hazy, sun-warmed atmosphere, while the surrounding information stays crisp enough for the can to read quickly at a distance.",
      "This is sample project copy for the page layout. Brand story, flavour range, materials and production notes can replace it when the case study is ready.",
    ],
    descriptionZh: [
      "失焦是一套以果味预调酒为主题的包装方向。标签从一个刻意柔化的字标开始，让视线在识别风味之前，先经历一瞬间的朦胧停顿。",
      "明亮的粉与橙构成带有日晒感的雾化氛围；围绕它的产品信息则保持清晰，使包装在陈列距离中依然能够被快速阅读。",
      "此处为展示页面结构而写的示例文案。正式案例完成后，可替换为品牌背景、口味系列、材质和打样记录。",
    ],
  },
  {
    id: "trace",
    title: "Trace",
    titleZh: "Trace",
    subtitle: "Skincare packaging / 2024",
    subtitleZh: "护肤精华包装 / 2024",
    sign: "/packaging/sign-2.png",
    assetDir: "trace",
    images: ["1.jpg", "2.jpg", "3.jpg"],
    description: [
      "Trace is a skincare packaging study built around the feeling of a botanical ingredient leaving a gentle mark. The identity gives rosemary room to appear as both an active component and a quiet visual gesture.",
      "The paper-toned palette and handwritten botanical forms keep the system tactile, while the product data follows a disciplined hierarchy for everyday use.",
      "This is provisional copy for the portfolio view. It can later be replaced with the project brief, ingredient research and the complete packaging specification.",
    ],
    descriptionZh: [
      "Trace 是一项护肤精华包装练习，围绕植物成分留下温和痕迹的感受展开。迷迭香既作为有效成分出现，也成为贯穿画面的安静图形线索。",
      "纸张般的中性色和手写感植物图形让系统保持触感；产品信息则采用克制、清晰的层级，以满足日常使用时的识别需求。",
      "当前文字为作品集页面的临时示例。之后可替换为项目简报、成分研究和完整包装规格说明。",
    ],
  },
];

export function PackagingDesignPage() {
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
    <main className="brand-page packaging-page">
      <Link className="brand-back" href="/" aria-label="返回路牌首页">← Index</Link>

      <header className="brand-sign-rail" aria-label="包装设计项目导航">
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
                <img src={project.sign} alt={`${project.titleZh} 项目路牌`} />
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
                      src={`/packaging/${active.assetDir}/${image}`}
                      alt={`${active.titleZh} 项目图 ${index + 1}`}
                      draggable="false"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="brand-panel brand-copy-panel">
              <div className="brand-panel-scroll brand-copy-scroll brand-copy-scroll-zh" ref={chineseRef} lang="zh-CN">
                <div className="brand-copy-inner brand-copy-inner-zh">
                  <p className="brand-kicker">包装设计 / {active.id}</p>
                  <h1>{active.titleZh}</h1>
                  <p className="brand-subtitle">{active.subtitleZh}</p>
                  <div className="brand-copy-rule" />
                  {active.descriptionZh.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <p className="brand-scroll-note">滚动浏览 · 01—03</p>
                </div>
              </div>
              <div className="brand-panel-scroll brand-copy-scroll brand-copy-scroll-en" ref={englishRef} lang="en">
                <div className="brand-copy-inner">
                  <p className="brand-kicker">Packaging design / {active.id}</p>
                  <h1>{active.title}</h1>
                  <p className="brand-subtitle">{active.subtitle}</p>
                  <div className="brand-copy-rule" />
                  {active.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <p className="brand-scroll-note">Scroll to explore · 01—03</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {active ? <p className="brand-footer-note">Selected packaging studies · 2024—25</p> : null}
    </main>
  );
}
