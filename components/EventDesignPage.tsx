"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type EventCopyBlock = string | {
  text: string;
  centered?: boolean;
  bold?: boolean;
};

type EventProject = {
  id: string;
  title: string;
  titleZh: string;
  sign: string;
  assetDir: string;
  images: string[];
  description: EventCopyBlock[];
  descriptionZh: EventCopyBlock[];
};

const projects: EventProject[] = [
  {
    id: "trash-shop",
    title: "Trash Shop",
    titleZh: "Trash Shop",
    sign: "/event/sign-1.png",
    assetDir: "trash-shop",
    images: ["2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    description: [
      "Trash Shop is a temporary creative event built around rejected ideas: unfinished drafts, abandoned directions and concepts that never found their final form. Instead of treating them as waste, the event invites people to look again and give them a second chance.",
      { text: "Give your rejected ideas a second chance.", centered: true, bold: true },
      "The visual identity borrows from rubbish cages, hand-drawn notices and improvised street signage. Bright blue, yellow, red and green create an energetic palette, while uneven outlines and torn-paper forms make the system feel direct, playful and deliberately unpolished.",
      "The event poster brings the project world together through a giant waste basket, flying scraps and an unexpected UFO. A flexible wayfinding system extends the same language into directional signs, helping visitors navigate the pop-up space without losing the spontaneous character of the event.",
      "Staff badges, trash tags and sticker sets turn the identity into objects that can be worn, exchanged and collected. Across print, space and motion, the materials frame discarded work not as failure, but as raw material for another beginning.",
    ],
    descriptionZh: [
      "Trash Shop 是一场围绕“被淘汰的创意”展开的临时活动。未完成的草稿、被放弃的方向，以及没有进入最终版本的想法，都可以在这里被重新看见。它们不再被当作废料，而是获得一次重新出发的机会。",
      { text: "Give your rejected ideas a second chance.\n给被拒绝的创意第二次机会。", centered: true, bold: true },
      "视觉系统从垃圾笼、手绘告示和临时街头标牌中提取语言。高明度的蓝、黄、红、绿构成充满能量的配色；不规则描边与撕纸般的轮廓，则让整体保持直接、幽默且刻意未经修饰的状态。",
      "活动海报以巨大的垃圾筐、飞散的纸团与突然出现的 UFO 共同建立项目世界。导视系统沿用相同的图形语言，将活动信息转化为不同方向的异形路牌，让观众在辨认空间路径的同时，也持续进入 Trash Shop 的叙事。",
      "工作人员胸牌、Trash 标签与贴纸套装把视觉识别延伸为可以佩戴、交换和收藏的活动物料。通过平面、空间与动态影像，这套设计把“废稿”从失败的结果，重新定义为下一次创作的原材料。",
    ],
  },
];

function renderCopyBlocks(blocks: EventCopyBlock[]) {
  return blocks.map((block, index) => {
    const content = typeof block === "string" ? { text: block } : block;
    const className = [
      "brand-copy-block",
      content.centered ? "is-centered" : "",
      content.bold ? "is-bold" : "",
    ].filter(Boolean).join(" ");

    return (
      <p className={className} key={`${content.text}-${index}`}>
        {content.centered
          ? content.text.split("\n").map((line, lineIndex) => (
              <span className="brand-copy-line" key={`${line}-${lineIndex}`}>{line}</span>
            ))
          : content.text}
      </p>
    );
  });
}

export function EventDesignPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const chineseRef = useRef<HTMLDivElement>(null);
  const englishRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    if (!activeId) return;
    const frame = requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => undefined);
    });
    return () => cancelAnimationFrame(frame);
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
    <main className="brand-page brand-design-page event-design-page">
      <Link className="brand-back" href="/" aria-label="返回路牌首页">← Index</Link>

      <header className="brand-sign-rail" aria-label="活动设计项目导航">
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
                <div className="brand-image-stack event-image-stack">
                  <div className="event-video-stage">
                    <video
                      ref={videoRef}
                      src={`/event/${active.assetDir}/1.mp4?v=portrait`}
                      aria-label={`${active.title} 项目动态展示`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                  {active.images.map((image, index) => (
                    <img
                      key={`${active.id}-${image}`}
                      src={`/event/${active.assetDir}/${image}`}
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
                  {renderCopyBlocks(active.descriptionZh)}
                </div>
              </div>
              <div className="brand-panel-scroll brand-copy-scroll brand-copy-scroll-en" ref={englishRef} lang="en">
                <div className="brand-copy-inner">
                  {renderCopyBlocks(active.description)}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
