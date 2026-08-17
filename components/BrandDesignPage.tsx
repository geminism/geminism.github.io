"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type BrandCopyBlock = string | {
  text: string;
  centered?: boolean;
  bold?: boolean;
  compact?: boolean;
};

type BrandProject = {
  id: string;
  title: string;
  subtitle: string;
  subtitleZh: string;
  sign: string;
  color: string;
  assetDir: string;
  images: string[];
  description: BrandCopyBlock[];
  descriptionZh: BrandCopyBlock[];
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
      "VERGE is a natural fragrance brand inspired by open landscapes, cold air and the quiet rhythms of nature. It explores the space between movement and stillness, the familiar and the unknown, the everyday and the wilderness. Through clear, restrained and fluid scents, VERGE creates a quiet interval for the senses to slow down and reconnect with the natural world.",
      { text: "For the space between breaths.", centered: true, bold: true },
      "The visual identity is built around breath, openness, fluidity and nature. A rounded sans-serif wordmark creates a soft, continuous rhythm, while generous spacing and the diagonal interruption introduce a subtle pause within the logo itself.",
      "The palette is drawn from volcanic rock, moss, snow and glacier ice, combining contrasts of rough and soft, dark and transparent, stillness and movement.",
      "Moss on Stone is the first fragrance series by VERGE, inspired by moss slowly growing across volcanic rock. The contrast between ancient stone and gradual organic growth reflects the quiet passage of time in nature, shaped by damp air, mineral surfaces and cold green notes.",
      { text: "On cold stone, moss keeps the memory of rain.\nA scent of slow time and quiet earth.", centered: true, bold: true, compact: true },
      "Transparent glass and streamlined forms reinforce the brand’s sense of clarity and breathability. Deep charcoal caps and outer packaging reference volcanic stone, while preserved moss introduces a tactile organic contrast.",
      "An irregular, subtly raised layer of moss is applied to each cap, creating slight variations between products and extending the experience from sight and scent into touch. The outer box continues this idea through a green organic texture that appears to slowly spread across the dark surface.",
    ],
    descriptionZh: [
      "VERGE / 临 是一个从荒原、冷空气与自然景观中汲取灵感的自然香氛品牌。",
      "“临”不是抵达，而是一种靠近的状态。临近风，临近水，临近旷野，也临近身体重新安静下来的瞬间。品牌试图捕捉自然与感官相遇时那些轻微而流动的痕迹，在一呼一吸之间，为日常留下一段短暂的空白。",
      { text: "For the space between breaths.\n呼吸之间。", centered: true, bold: true },
      "VERGE 的视觉语言围绕呼吸、留白、流动与自然展开。",
      "Logo采用现代感的圆角无衬线字形，以柔和连续的笔画弱化过于正式的气质，并赋予字标更加流动、可呼吸的视觉感受。字母之间的空间与中央的斜线形成一段短暂的“间隙”，回应品牌所强调的 space between breaths，同时呼应“临”所代表的靠近而未完全抵达的状态。",
      "品牌色彩取自荒原中的自然元素：深色火山岩、苔藓、积雪与冰川。粗粝与柔软、深色与透明、静止与流动之间的反差，共同构成 VERGE 冷冽而安静的视觉世界。",
      "Moss on Stone 是 VERGE 的第一个香氛系列，灵感来自生长在火山岩上的苔藓。坚硬、古老的岩石与柔软而缓慢生长的苔藓形成对比，记录自然中几乎难以察觉的时间变化。湿润空气、岩石、绿色植物与冷冽气息共同构成这一系列的感官想象。",
      { text: "On cold stone, moss keeps the memory of rain.\nA scent of slow time and quiet earth.", centered: true, bold: true, compact: true },
      "产品采用透明玻璃与圆润流线型轮廓，瓶盖与外包装采用取自火山岩的深炭色，并加入绿色苔藓元素，使包装本身形成“苔藓生长于岩石之上”的微型自然景观。瓶盖局部手工覆盖一片不规则的稳定化苔藓，略带厚度的触感打破工业化包装的统一性。自然形成的边缘与触觉差异使每件产品保留细微的独特性，也让视觉、嗅觉与触觉共同参与品牌体验。外包装则通过从边缘缓慢蔓延的绿色肌理延续这一概念，在深色矿物基底上留下自然生长的痕迹。",
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

function renderCopyBlocks(blocks: BrandCopyBlock[]) {
  return blocks.map((block, index) => {
    const content = typeof block === "string" ? { text: block } : block;
    const className = [
      "brand-copy-block",
      content.centered ? "is-centered" : "",
      content.bold ? "is-bold" : "",
      content.compact ? "is-compact" : "",
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
    <main className="brand-page brand-design-page" style={{ "--brand-accent": active?.color ?? "#d5d6d2" } as React.CSSProperties}>
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
