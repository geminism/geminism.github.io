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
      "Margin Notes is a contemporary art bookshop for art books, independent publications, and small-press zines. Inspired by sticky notes, index tabs, markers, and highlighted reading traces, the brand transforms everyday annotation tools into a bold visual identity. It celebrates the voices and ideas found at the margins of visual culture.",
      { text: "Found in the Margins.", centered: true, bold: true },
      "The logo is built from stacked geometric blocks, referencing piles of art books, zines, sticky notes, and index labels. The folded corner detail is inspired by page tabs and annotation stickers, echoing the idea of marking, returning, and reading beyond the main text.",
      "The colour palette is inspired by everyday annotation tools such as sticky notes, index tabs, and highlighters,. Bright green, yellow, blue, and pink create a playful visual language, while dark charcoal balances the system with clarity and contrast. The vivid colours also echo the Memphis-inspired interior style, giving the brand a bold, experimental, and contemporary character.",
      "The brand materials extend the logic of annotation into the bookshop environment. Wayfinding signs, membership cards, packaging bags, and window posters use bold colour blocks, folded labels, and category codes to create a playful but organised visual system.",
      { text: "The Margin is Where New Ideas Begin.", centered: true, bold: true, compact: true },
      "Margin Notes also functions as a cultural space for workshops, talks, zine fairs, and community events. The event visuals demonstrate the flexibility and adaptability of the Margin Notes identity system. depending on the type of event, it can extend into different visual styles, while remaining unified through the brand colour palette, folded-corner motif, layered layouts, and annotation-inspired details. In this way, the brand’s visual language continues to evolve, while also reflecting the openness and inclusivity at the heart of Margin Notes.",
      "The product range turns the brand concept into functional reading tools. Bookmarks and sticky notes are designed to help readers mark, organise, collect, and return to printed matter. These objects are not only merchandise, but part of the reading experience.",
    ],
    descriptionZh: [
      "Margin Notes 是一家关注艺术书、独立出版与小众zine的现代艺术书店。品牌灵感来源于便签纸、口取纸、记号笔与阅读中的高亮痕迹，将日常标注工具转化为鲜明的视觉语言。它关注那些存在于视觉文化边缘的声音、图像与想法。",
      { text: "Found in the Margins.", centered: true, bold: true },
      "标志由层叠的几何色块组成，既像堆叠的艺术书籍，也呼应便签纸和索引标签的形态。右上角的折角细节来源于口取纸与页边标记，象征阅读中的标注、返回与再发现。",
      "品牌色彩来源于便签纸、口取纸、荧光笔等日常标注工具。明亮的绿色、黄色、蓝色与粉色构成活泼且具有视觉冲击力的识别语言，而深灰色则用于平衡整体系统，增强信息的清晰度与对比度。这组高饱和色彩也呼应了店内孟菲斯风格的空间设定，使品牌呈现出大胆、实验且当代的视觉气质。",
      "品牌物料将“标注”的逻辑延展到书店空间中。导视牌、会员卡、包装袋与橱窗海报延续了色块、折角标签与分类编号的视觉语言，形成一个活泼但有秩序的识别系统。",
      { text: "The Margin is Where New Ideas Begin.", centered: true, bold: true, compact: true },
      "Margin Notes不只是书店，也是一处承载工作坊、艺术家分享、zine市集与社区活动的文化空间。品牌视觉系统的可延展性在这里大放异彩，根据活动类型可以延展出不同的视觉风格，但整体仍通过品牌色彩、折角符号、层叠排版与标注感细节保持统一。品牌的视觉语言得以延续，但也昭示着Margin Notes本身的高度包容性。",
      "售卖产品将品牌概念转化为可使用的阅读工具。书签、便签纸等帮助读者标记、整理、收藏并重新回到纸本内容之中。它们不仅是品牌周边，也是阅读体验的一部分。",
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
      "BE STUDIO is a pottery studio inspired by the quiet, imperfect beauty of handmade objects. Rooted in an Eastern wabi-sabi sensibility, the brand embraces natural materials, irregular forms and the traces left by hands, clay and fire. Rather than pursuing absolute perfection, BE STUDIO celebrates objects as they are — tactile, individual and always slightly unfinished.",
      { text: "Let things be.", centered: true, bold: true },
      "The logo transforms the lowercase b and e into the silhouette of a handmade ceramic vessel. Its asymmetrical proportions and hand-drawn edges retain the irregularity of pottery made by hand, allowing the mark to sit somewhere between a letter and an object. A slightly rough, imperfect finish further reinforces the tactile character of clay and the visual language of the studio.",
      "The wider visual system is built from simplified silhouettes of cups, bowls, vases and vessels. Each form is reduced to a bold, hand-drawn shape, creating a family of graphics that feels spontaneous yet consistent. The colour palette draws from raw clay, mineral pigments and natural ceramic surfaces, combining muted earthy tones with generous negative space.",
      "The identity extends into tactile applications through textured paper, embossed and engraved surfaces, natural fabrics and matte finishes. Rather than simply representing pottery visually, the brand system brings the physical qualities of clay into the experience of the identity itself.",
    ],
    descriptionZh: [
      "BE STUDIO 是一家关注手作质感与日常器物的当代陶艺工作室。品牌从东方侘寂美学中汲取灵感，保留泥土本身的质地、不规则的器形，以及双手与火留下的自然痕迹。相比追求绝对精致与统一，BE STUDIO 更关注每一件器物独有的状态与手工温度。",
      { text: "Let things be.\n让事物如其所是。", centered: true, bold: true },
      "Logo以小写字母 b与e 为基础，将字母结构与陶器轮廓融合。略微倾斜的器形、不完全对称的比例与手绘笔触刻意保留了手工制作中的不规则感，使图形介于“字母”与“器物”之间。粗粝而不完全均匀的边缘，也呼应了陶土本身自然、朴拙的触感。",
      "辅助图形从杯、碗、花瓶与陶罐等日常器物中提取，以简化的手绘剪影重新呈现。",
      "不同器形保留各自的差异，却通过统一的笔触、比例与色彩形成完整的视觉系统。品牌色彩则取自陶土、矿物与天然釉面的低饱和色调，并通过大量留白营造安静而自然的视觉节奏。",
      "品牌应用进一步强调“触感”。粗纹纸张、压印与凹刻、天然织物以及哑光表面，使视觉识别不只停留在平面图形中，而是将陶土所具有的粗糙、温润与手工感延伸到真实的品牌接触点中。",
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
