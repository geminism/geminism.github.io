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
  video?: string;
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
    video: "1.mp4",
    images: ["2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    description: [
      "TRASH SHOP is a student creative market at the University of Leeds, created to give rejected, unused and abandoned creative work a second chance to be seen. Student designers can submit their discarded work, set their own prices and put these ideas back into circulation, allowing them to be discovered, purchased and reused by other students.",
      "Creative work is not necessarily without value simply because it has been rejected. Sometimes, it simply was not right for a particular brief, client or moment. TRASH SHOP aims to give these ideas another chance to circulate, allowing work that once ended up in the “trash” to be seen again.",
      "Visually, the identity does not attempt to polish or beautify this so-called “discarded work”. Instead, it embraces its weirdness, imperfections and unfinished qualities, preserving the messy, spontaneous and sometimes absurd nature of the creative process. Highly saturated colours are combined with hand-drawn lines, crumpled paper, trash bins and deliberately irregular typography. In the animated poster, a crumpled piece of paper gradually unfolds, symbolising a discarded idea being given another chance. The alien, meanwhile, represents you and me—every creator searching for ideas and finding ways to bring them to life.",
    ],
    descriptionZh: [
      "TRASH SHOP（垃圾商店）是一个面向利兹大学学生的校园创意市集，旨在为被否决、未采用或被搁置的创意作品提供第二次被看见的机会。学生设计师可以投稿自己的“废稿”并自主定价，让这些原本退出创作流程的作品重新进入流通，被其他学生发现、购买和再利用。",
      "创意作品被淘汰，并不一定意味着它没有价值。它可能只是不适合某一份设计简报、某一个客户，或某一个特定的时刻。TRASH SHOP 希望重新赋予这些作品流通的可能，让被放进“垃圾桶”的想法重新拥有被看见的机会。",
      "视觉上，品牌并不试图美化所谓的“废稿”，而是主动放大它们的怪异、不完美与未完成感，并保留创作过程中混乱、随性甚至有些荒诞的状态。高饱和色彩与手绘线条、纸团、垃圾桶和刻意不规整的字体相结合。在动态海报中，揉皱的纸团逐渐展开，象征着被丢弃的作品重新获得机会；外星人则代表你和我，代表每一个正在寻找并实现创意的创作者。",
    ],
  },
  {
    id: "nothing-happens",
    title: "Nothing Happens Park",
    titleZh: "无事发生公园",
    sign: "/event/sign-2.png",
    assetDir: "nothing-happens",
    images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    description: [
      "Nothing Happens Park is an outdoor event that makes room for idleness. With no timetable to follow and no task to complete, visitors are invited to lie on the grass, slow down and spend an afternoon without turning rest into another form of productivity.",
      { text: "Nothing is scheduled today.\nCome lie down on the grass.", centered: true, bold: true },
      "The identity turns the event’s relaxed posture into a soft yellow figure stretched across a picnic mat. Sky blue, lawn green and sunlit yellow create an open, optimistic palette, while blurred edges and handwritten lettering keep the visual language loose and unhurried.",
      "The online experience begins with an overloaded daily schedule before gradually opening into the park. It introduces the event through a long-form mobile page, picnic products and simple activity prompts, shifting the rhythm from constant switching to deliberate pause.",
      "Offline materials extend the same atmosphere across entrance signs, fabric banners, picnic mats and small achievement cards. Together they create a temporary park where choosing to do nothing becomes a shared and visible activity.",
    ],
    descriptionZh: [
      "无事发生公园是一场为“无所事事”留出空间的户外活动。这里没有必须遵循的时间表，也没有需要完成的任务；观众可以躺在草地上、放慢速度，度过一个不必把休息再次变成效率指标的下午。",
      { text: "今天没有安排。\n来草地躺一下。", centered: true, bold: true },
      "视觉识别把活动中松弛的身体状态转化为躺在野餐垫上的柔软黄色人形。天空蓝、草地绿与日光黄构成明亮开放的色彩关系；带有模糊边缘的图形和手写字体，则让整体保持随意、缓慢且没有压力的节奏。",
      "线上体验从被日程占满的一天开始，随后逐渐进入公园。移动端长页面依次介绍活动概念、野餐系列物料和轻量互动，引导阅读节奏从频繁切换转向有意识的停顿。",
      "线下物料将相同氛围延伸到入口标识、布面横幅、野餐垫和小型成就卡中。它们共同建立出一个临时公园，让“今天成功什么也没做”成为可以被分享、被看见的活动体验。",
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
                <div className={`brand-image-stack event-image-stack ${active.video ? "has-video" : ""}`}>
                  {active.video ? (
                    <div className="event-video-stage">
                      <video
                        ref={videoRef}
                        src={`/event/${active.assetDir}/${active.video}?v=hd`}
                        aria-label={`${active.title} 项目动态展示`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  ) : null}
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
