"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PackagingProject = {
  id: string;
  title: string;
  titleZh: string;
  sign: string;
  assetDir: string;
  images: string[];
  description: PackagingCopyBlock[];
  descriptionZh: PackagingCopyBlock[];
};

type PackagingCopySegment = string | {
  text: string;
  bold?: boolean;
};

type PackagingCopyBlock = string | {
  text?: string;
  segments?: PackagingCopySegment[];
};

const projects: PackagingProject[] = [
  {
    id: "focus",
    title: "Focus",
    titleZh: "失焦",
    sign: "/packaging/sign-1.png",
    assetDir: "focus",
    images: ["1.jpg", "2.jpg", "3.jpg"],
    description: [
      "“FOCUS” takes the hazy, relaxed sensory experience of being slightly tipsy as its visual starting point. Through expansive diffused gradients and blurred typography, the packaging translates the gradual dissolution of boundaries between colour and information into a visual language. This responds directly to the concept “out of focus” while evoking the dreamy state between clarity and mild intoxication. Each flavour is distinguished through colours derived from its key ingredients, allowing colour to function both as an emotional device and as a cue for flavour recognition.",
      {
        segments: [
          "In terms of information hierarchy, the design deliberately creates a contrast between ",
          { text: "clarity and blur", bold: true },
          ". Enlarged, blurred typography conveys mood and visual impact, while essential information such as flavour names and product categories remains clear, forming a secondary reading layer. Variations in scale, sharpness, placement and negative space extend the visual idea of “out of focus” while maintaining the readability of key product information.",
        ],
      },
    ],
    descriptionZh: [
      "“失焦”以微醺状态下朦胧、松弛的感官体验作为视觉出发点。包装通过大面积弥散渐变与模糊文字，将色彩和信息逐渐失去边界的状态转化为视觉语言，呼应“失焦”这一名称，也呈现介于清醒与微醺之间的迷离感。不同口味以原料本身的色彩印象建立系列区分，使色彩同时承担情绪表达与风味识别的功能。",
      "在信息层级上，设计刻意建立“清晰”与“模糊”的对比：放大的模糊文字承担情绪表达与视觉吸引力，口味名称、产品类别等核心信息则保持清晰，形成第二阅读层级。通过字号、清晰度、位置与留白的变化，包装在保持基本信息可读性的同时，也延续了“失焦”的视觉体验。",
    ],
  },
  {
    id: "trace",
    title: "Trace",
    titleZh: "Trace",
    sign: "/packaging/sign-2.png",
    assetDir: "trace",
    images: ["1.jpg", "2.jpg", "3.jpg"],
    description: [
      "TRACE is a skincare brand centred on nature, restoration and a pared-back approach to care. The brand seeks to strip away excess and unnecessary complexity from everyday skincare, returning attention to plants, skin and sensory experience, and leaving a light yet lasting trace through a quiet, considered ritual.",
      "Rosemary is the key ingredient throughout the collection and also serves as the central visual motif across the packaging system. Inspired by botanical printing, the rosemary imagery retains irregular edges, variations in density and subtle imperfections, as though the plant has briefly rested on the surface and left behind a natural imprint. Across the cleanser, serum and cream, rosemary appears at different scales, orientations and crops, allowing each product to remain distinct while sharing a continuous botanical language and a cohesive visual rhythm.",
      "The colour palette combines soft off-whites with muted greens to create a calm, airy foundation, while vivid botanical green provides the primary visual focus. Deep brown typography adds warmth and balances the organic character with a more contemporary sensibility. In the information hierarchy, key product features and category names form the primary reading path, while supporting details recede into a secondary level, allowing the botanical imagery to carry both mood and recognition.",
    ],
    descriptionZh: [
      "TRACE 是一个以自然、疗愈与精简护理为核心的护肤品牌。品牌希望从日常护肤中剥离过度修饰与复杂步骤，将注意力重新放回植物、肌肤与感受本身，在克制而安静的护理节奏中，留下轻盈却持续的痕迹。",
      "该系列的主要原料是迷迭香，视觉系统也选择以迷迭香作为贯穿整个系列的核心元素，并以植物拓印的风格进行转译。枝叶并非以完整、规整的植物插画出现，而是保留压印后略显不均的边缘、浓淡与残缺感，如同植物曾短暂停留于纸面，并留下自然生长的痕迹。迷迭香在不同包装中以不同尺度、方向与裁切方式延展，使洁面、精华与面霜在保持各自信息独立的同时，共享同一种植物语言，也让系列之间形成连续而统一的视觉节奏。",
      "色彩以柔和的米白与低饱和绿色系建立安静、通透的基调，鲜明的植物绿色则成为画面中最主要的视觉焦点，与深棕色文字共同平衡自然感与现代感。信息层级上，产品特点与品类名称构成主要阅读路径，其他信息退居次级，使植物图形承担情绪表达与识别功能。",
    ],
  },
];

function renderCopyBlocks(blocks: PackagingCopyBlock[]) {
  return blocks.map((block, index) => {
    if (typeof block === "string") {
      return <p className="brand-copy-block" key={`${block}-${index}`}>{block}</p>;
    }

    const key = block.text ?? block.segments?.map((segment) => (
      typeof segment === "string" ? segment : segment.text
    )).join("") ?? String(index);

    return (
      <p className="brand-copy-block" key={`${key}-${index}`}>
        {block.segments?.map((segment, segmentIndex) => (
          typeof segment === "string"
            ? segment
            : <strong key={`${segment.text}-${segmentIndex}`}>{segment.text}</strong>
        )) ?? block.text}
      </p>
    );
  });
}

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
    <main className="brand-page brand-design-page packaging-page">
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
