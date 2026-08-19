"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type TextAlign = "left" | "center" | "right";
type LineStyle = "solid" | "dashed" | "dotted";
type EditorElement = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: TextAlign;
  lineStyle?: LineStyle;
  lineThickness?: number;
  text?: string;
};

type EditorLayout = {
  version: 1;
  elements: Record<string, EditorElement>;
};

type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  canvasX: number;
  canvasY: number;
};

type Manipulation = {
  kind: "drag" | "resize" | "rotate";
  id: string;
  startX: number;
  startY: number;
  startAngle: number;
  centerX: number;
  centerY: number;
  canvasWidth: number;
  before: EditorLayout;
  start: EditorElement;
};

const STORAGE_KEY = "about-layout-editor-v1";
const EMPTY_LAYOUT: EditorLayout = { version: 1, elements: {} };

const ELEMENT_LABELS: Record<string, string> = {
  pole: "黑色金属杆",
  photo: "圆形照片牌",
  warning: "三角装饰牌",
  cone: "橙色路障",
  "name-en": "英文姓名",
  "name-zh": "中文姓名",
  "intro-slash": "顶部斜线",
  role: "英文简介",
  "what-en": "WHAT I DO",
  "what-slash": "设计方向斜线",
  "what-zh": "设计方向",
  "what-copy": "设计方向内容",
  "what-rule": "设计方向分隔线",
  "education-en": "EDUCATION",
  "education-slash": "教育经历斜线",
  "education-zh": "教育经历",
  "edu-1-date": "第一段教育日期",
  "edu-1-en": "第一段教育英文",
  "edu-1-zh": "第一段教育中文",
  "education-divider": "教育经历虚线",
  "edu-2-date": "第二段教育日期",
  "edu-2-en": "第二段教育英文",
  "edu-2-zh": "第二段教育中文",
  "law-note": "法律转行注释",
  "education-rule": "教育经历分隔线",
  "experience-en": "EXPERIENCE",
  "experience-slash": "工作经历斜线",
  "experience-zh": "工作经历",
  "exp-1-date": "第一段工作日期",
  "exp-1-en": "第一段工作英文",
  "exp-1-zh": "第一段工作中文",
  "experience-divider": "工作经历虚线",
  "exp-2-date": "第二段工作日期",
  "exp-2-en": "第二段工作英文",
  "exp-2-zh": "第二段工作中文",
};

const LINE_IDS = new Set([
  "what-rule",
  "education-divider",
  "education-rule",
  "experience-divider",
]);

const cloneLayout = (layout: EditorLayout): EditorLayout => JSON.parse(JSON.stringify(layout));

function renderLines(value: string) {
  const lines = value.split("\n");
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function EditableParagraphs({ value }: { value: string }) {
  return value.split("\n").map((line, index) => <p key={`${line}-${index}`}>{line || "\u00a0"}</p>);
}

function AboutDate({ value }: { value: string }) {
  const [start = "", end = ""] = value.split("\n");
  const renderDate = (date: string) => (
    <span>
      {[...date].map((character, index) => character === "4"
        ? <b className="about-coordinate-number-fallback" key={`${character}-${index}`}>4</b>
        : character)}
    </span>
  );

  return (
    <>
      {renderDate(start)}
      <i aria-hidden="true" />
      {renderDate(end)}
    </>
  );
}

export function AboutPage() {
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<EditorLayout>(EMPTY_LAYOUT);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [status, setStatus] = useState("本地自动保存已开启");
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const manipulationRef = useRef<Manipulation | null>(null);
  const historyRef = useRef<{ past: EditorLayout[]; future: EditorLayout[] }>({ past: [], future: [] });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const desktop = window.matchMedia("(min-width: 761px)").matches;
    const shouldEdit = params.get("edit") === "1" && desktop;
    setEditMode(shouldEdit);

    if (shouldEdit) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as EditorLayout;
          if (parsed.version === 1 && parsed.elements && typeof parsed.elements === "object") {
            setLayout(parsed);
          }
        }
      } catch {
        setStatus("本地布局读取失败，已使用默认布局");
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!editMode || !ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    setStatus("已自动保存到此浏览器");
  }, [editMode, layout, ready]);

  const elementStyle = useCallback((id: string): CSSProperties => {
    const element = layout.elements[id] ?? {};
    const custom = {
      "--editor-x": `${element.x ?? 0}vw`,
      "--editor-y": `${element.y ?? 0}vw`,
      "--editor-rotate": `${element.rotate ?? 0}deg`,
      ...(element.lineThickness !== undefined
        ? { "--editor-line-thickness": `${element.lineThickness}px` }
        : {}),
    } as CSSProperties;

    if (element.width !== undefined) custom.width = `${element.width}vw`;
    if (element.height !== undefined) custom.height = `${element.height}vw`;
    if (element.fontSize !== undefined) custom.fontSize = `${element.fontSize}vw`;
    if (element.fontFamily !== undefined) custom.fontFamily = element.fontFamily;
    if (element.fontWeight !== undefined) custom.fontWeight = element.fontWeight;
    if (element.lineHeight !== undefined) custom.lineHeight = element.lineHeight;
    if (element.letterSpacing !== undefined) custom.letterSpacing = `${element.letterSpacing}em`;
    if (element.textAlign !== undefined) custom.textAlign = element.textAlign;
    if (element.lineStyle !== undefined) custom.borderTopStyle = element.lineStyle;
    return custom;
  }, [layout.elements]);

  const textValue = useCallback((id: string, fallback: string) => layout.elements[id]?.text ?? fallback, [layout.elements]);

  const editorProps = useCallback((id: string, editable = false) => ({
    "data-editor-id": id,
    ...(editable ? { "data-editable-text": "true", suppressContentEditableWarning: true } : {}),
    className: editMode ? "about-coordinate-editor-target" : undefined,
    style: elementStyle(id),
  }), [editMode, elementStyle]);

  const refreshSelection = useCallback(() => {
    if (!editMode || !selectedId || !canvasRef.current) {
      setSelectionBox(null);
      return;
    }
    const target = canvasRef.current.querySelector<HTMLElement>(`[data-editor-id="${selectedId}"]`);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setSelectionBox({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      canvasX: ((rect.left - canvasRect.left) / canvasRect.width) * 100,
      canvasY: ((rect.top - canvasRect.top) / canvasRect.width) * 100,
    });
  }, [editMode, selectedId]);

  useEffect(() => {
    refreshSelection();
    window.addEventListener("resize", refreshSelection);
    window.addEventListener("scroll", refreshSelection, true);
    return () => {
      window.removeEventListener("resize", refreshSelection);
      window.removeEventListener("scroll", refreshSelection, true);
    };
  }, [layout, refreshSelection]);

  const setElement = useCallback((id: string, patch: Partial<EditorElement>, recordHistory = true) => {
    setLayout((current) => {
      if (recordHistory) {
        historyRef.current.past.push(cloneLayout(current));
        historyRef.current.future = [];
      }
      return {
        version: 1,
        elements: {
          ...current.elements,
          [id]: { ...current.elements[id], ...patch },
        },
      };
    });
  }, []);

  const undo = useCallback(() => {
    setLayout((current) => {
      const previous = historyRef.current.past.pop();
      if (!previous) return current;
      historyRef.current.future.push(cloneLayout(current));
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setLayout((current) => {
      const next = historyRef.current.future.pop();
      if (!next) return current;
      historyRef.current.past.push(cloneLayout(current));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!editMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editMode, redo, undo]);

  const startManipulation = useCallback((kind: Manipulation["kind"], id: string, clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const target = canvasRef.current.querySelector<HTMLElement>(`[data-editor-id="${id}"]`);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const start = layout.elements[id] ?? {};
    manipulationRef.current = {
      kind,
      id,
      startX: clientX,
      startY: clientY,
      startAngle: Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * 180 / Math.PI,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      canvasWidth: canvasRect.width,
      before: cloneLayout(layout),
      start: {
        ...start,
        width: start.width ?? (rect.width / canvasRect.width) * 100,
        height: start.height ?? (rect.height / canvasRect.width) * 100,
      },
    };
    document.body.classList.add("about-editor-manipulating");
  }, [layout]);

  useEffect(() => {
    if (!editMode) return;
    const onPointerMove = (event: PointerEvent) => {
      const active = manipulationRef.current;
      if (!active) return;
      const dx = ((event.clientX - active.startX) / active.canvasWidth) * 100;
      const dy = ((event.clientY - active.startY) / active.canvasWidth) * 100;
      if (active.kind === "drag") {
        setElement(active.id, { x: (active.start.x ?? 0) + dx, y: (active.start.y ?? 0) + dy }, false);
      } else if (active.kind === "resize") {
        setElement(active.id, {
          width: Math.max(0.4, (active.start.width ?? 1) + dx),
          height: Math.max(0.4, (active.start.height ?? 1) + dy),
        }, false);
      } else {
        const angle = Math.atan2(event.clientY - active.centerY, event.clientX - active.centerX) * 180 / Math.PI;
        setElement(active.id, { rotate: (active.start.rotate ?? 0) + angle - active.startAngle }, false);
      }
    };
    const onPointerUp = () => {
      const active = manipulationRef.current;
      if (!active) return;
      historyRef.current.past.push(active.before);
      historyRef.current.future = [];
      manipulationRef.current = null;
      document.body.classList.remove("about-editor-manipulating");
      setStatus("已自动保存到此浏览器");
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [editMode, setElement]);

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode || event.button !== 0) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-editor-id]");
    if (!target || target.closest("[contenteditable=\"true\"]")) {
      if (!target) setSelectedId(null);
      return;
    }
    const id = target.dataset.editorId;
    if (!id) return;
    event.preventDefault();
    setSelectedId(id);
    startManipulation("drag", id, event.clientX, event.clientY);
  };

  const onCanvasDoubleClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-editable-text]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    const id = target.dataset.editorId;
    if (id) setSelectedId(id);
    target.contentEditable = "true";
    target.dataset.editing = "true";
    target.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(target);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const onCanvasBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-editable-text]");
    if (!target || target.dataset.editing !== "true") return;
    const id = target.dataset.editorId;
    target.contentEditable = "false";
    delete target.dataset.editing;
    if (id) setElement(id, { text: target.innerText.replace(/\n{3,}/g, "\n\n").trim() });
  };

  const selectedElement = selectedId ? layout.elements[selectedId] ?? {} : {};
  const selectedTarget = selectedId && canvasRef.current
    ? canvasRef.current.querySelector<HTMLElement>(`[data-editor-id="${selectedId}"]`)
    : null;
  const selectedComputed = selectedTarget ? window.getComputedStyle(selectedTarget) : null;
  const viewportWidth = typeof window === "undefined" ? 1 : window.innerWidth;
  const numericValue = (property: keyof EditorElement, fallback = 0) => {
    const saved = selectedElement[property];
    if (typeof saved === "number") return Number(saved.toFixed(3));
    if (!selectedComputed || !selectionBox) return fallback;
    if (property === "width") return Number(((selectionBox.width / viewportWidth) * 100).toFixed(3));
    if (property === "height") return Number(((selectionBox.height / viewportWidth) * 100).toFixed(3));
    if (property === "fontSize") return Number(((parseFloat(selectedComputed.fontSize) / viewportWidth) * 100).toFixed(3));
    if (property === "lineHeight") return Number((parseFloat(selectedComputed.lineHeight) / parseFloat(selectedComputed.fontSize)).toFixed(2));
    if (property === "letterSpacing") return selectedComputed.letterSpacing === "normal" ? 0 : Number((parseFloat(selectedComputed.letterSpacing) / parseFloat(selectedComputed.fontSize)).toFixed(3));
    return fallback;
  };

  const updateNumber = (property: keyof EditorElement, value: string) => {
    if (!selectedId) return;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setElement(selectedId, { [property]: parsed });
  };

  const resetLayout = () => {
    if (!window.confirm("恢复关于我页面的默认布局？当前浏览器中的编辑记录会被清除。")) return;
    historyRef.current.past.push(cloneLayout(layout));
    historyRef.current.future = [];
    window.localStorage.removeItem(STORAGE_KEY);
    setLayout(EMPTY_LAYOUT);
    setSelectedId(null);
    setStatus("已恢复默认布局");
  };

  const exportLayout = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "about-layout.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("布局 JSON 已导出");
  };

  const importLayout = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as EditorLayout;
        if (parsed.version !== 1 || !parsed.elements || typeof parsed.elements !== "object") throw new Error("invalid");
        historyRef.current.past.push(cloneLayout(layout));
        historyRef.current.future = [];
        setLayout(parsed);
        setSelectedId(null);
        setStatus("布局 JSON 已导入并保存在此浏览器");
      } catch {
        setStatus("导入失败：请选择由此编辑器导出的 JSON 文件");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className={`about-coordinate-page${editMode ? " is-editing" : ""}`}>
      <div
        ref={canvasRef}
        className="about-coordinate-canvas"
        onPointerDown={onCanvasPointerDown}
        onDoubleClick={onCanvasDoubleClick}
        onBlurCapture={onCanvasBlur}
      >
        <Link className="about-coordinate-back" href="/" aria-label="返回首页">
          ← Index
        </Link>

        {editMode ? <div className="about-editor-guides" aria-hidden="true" /> : null}

        <aside className="about-coordinate-installation" aria-label="个人照片路牌装置">
          <span {...editorProps("pole")} className={`about-coordinate-pole${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true" />

          <div {...editorProps("photo")} className={`about-coordinate-photo${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="个人照片占位">
            <span>照片</span>
          </div>

          <div {...editorProps("warning")} className={`about-coordinate-warning${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="三角形装饰路牌">
            <span className="about-coordinate-warning-red" aria-hidden="true">
              <span className="about-coordinate-warning-white">
                <i className="about-coordinate-exclamation" />
                <i className="about-coordinate-eyes" />
              </span>
            </span>
          </div>

          <div {...editorProps("cone")} className={`about-coordinate-cone${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="橙色路障" />
        </aside>

        <article className="about-coordinate-copy">
          <header className="about-coordinate-intro">
            <div className="about-coordinate-name">
              <h1 {...editorProps("name-en", true)}>{textValue("name-en", "GEMINI KONG")}</h1>
              <p {...editorProps("name-zh", true)} lang="zh-CN">{textValue("name-zh", "孔 令杰")}</p>
            </div>
            <span {...editorProps("intro-slash")} className={`about-coordinate-slash${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true">/</span>
            <p {...editorProps("role", true)} className={`about-coordinate-role${editMode ? " about-coordinate-editor-target" : ""}`}>
              {renderLines(textValue("role", "Graphic designer\nworking across\nbranding,\npackaging\nand visual communication."))}
            </p>
          </header>

          <section className="about-coordinate-what" aria-labelledby="about-what-title">
            <h2 id="about-what-title">
              <span {...editorProps("what-en", true)}>{textValue("what-en", "WHAT I DO")}</span>
              <b {...editorProps("what-slash")} aria-label="斜线">/</b>
              <span {...editorProps("what-zh", true)} lang="zh-CN">{textValue("what-zh", "设计方向")}</span>
            </h2>
            <p {...editorProps("what-copy", true)}>{textValue("what-copy", "Branding • Packaging • Campaigns • Visual Systems")}</p>
            <span {...editorProps("what-rule")} className={`about-coordinate-rule about-coordinate-what-rule${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true" />
          </section>

          <section className="about-coordinate-section about-coordinate-education" aria-labelledby="about-education-title">
            <h2 id="about-education-title">
              <span {...editorProps("education-en", true)}>{textValue("education-en", "EDUCATION")}</span>
              <b {...editorProps("education-slash")} aria-label="斜线">/</b>
              <span {...editorProps("education-zh", true)} lang="zh-CN">{textValue("education-zh", "教育经历")}</span>
            </h2>

            <div className="about-coordinate-row">
              <div {...editorProps("edu-1-date", true)} className={`about-coordinate-date${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="25.09 至 26.08">
                <AboutDate value={textValue("edu-1-date", "25.09\n26.08")} />
              </div>
              <div {...editorProps("edu-1-en", true)} className={`about-coordinate-english${editMode ? " about-coordinate-editor-target" : ""}`}>
                <EditableParagraphs value={textValue("edu-1-en", "University of Leeds\nMA Culture, Creativity and Entrepreneurship")} />
              </div>
              <div {...editorProps("edu-1-zh", true)} className={`about-coordinate-chinese${editMode ? " about-coordinate-editor-target" : ""}`} lang="zh-CN">
                <EditableParagraphs value={textValue("edu-1-zh", "文化、创意与创业硕士\n利兹大学")} />
              </div>
            </div>
            <span {...editorProps("education-divider")} className={`about-coordinate-rule about-coordinate-education-divider${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true" />

            <div className="about-coordinate-row about-coordinate-law-row">
              <div {...editorProps("edu-2-date", true)} className={`about-coordinate-date${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="20.09 至 24.07">
                <AboutDate value={textValue("edu-2-date", "20.09\n24.07")} />
              </div>
              <div {...editorProps("edu-2-en", true)} className={`about-coordinate-english${editMode ? " about-coordinate-editor-target" : ""}`}>
                <EditableParagraphs value={textValue("edu-2-en", "Central University of Finance and Economics\nLLB Law")} />
              </div>
              <div {...editorProps("edu-2-zh", true)} className={`about-coordinate-chinese${editMode ? " about-coordinate-editor-target" : ""}`} lang="zh-CN">
                <EditableParagraphs value={textValue("edu-2-zh", "法学学士\n中央财经大学")} />
              </div>
              <aside {...editorProps("law-note", true)} className={`about-coordinate-note${editMode ? " about-coordinate-editor-target" : ""}`}>{textValue("law-note", "yeah, I used to study law...")}</aside>
            </div>
            <span {...editorProps("education-rule")} className={`about-coordinate-rule about-coordinate-education-rule${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true" />
          </section>

          <section className="about-coordinate-section about-coordinate-experience" aria-labelledby="about-experience-title">
            <h2 id="about-experience-title">
              <span {...editorProps("experience-en", true)}>{textValue("experience-en", "EXPERIENCE")}</span>
              <b {...editorProps("experience-slash")} aria-label="斜线">/</b>
              <span {...editorProps("experience-zh", true)} lang="zh-CN">{textValue("experience-zh", "工作经历")}</span>
            </h2>

            <div className="about-coordinate-row">
              <div {...editorProps("exp-1-date", true)} className={`about-coordinate-date${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="25.05 至 25.08">
                <AboutDate value={textValue("exp-1-date", "25.05\n25.08")} />
              </div>
              <div {...editorProps("exp-1-en", true)} className={`about-coordinate-english${editMode ? " about-coordinate-editor-target" : ""}`}>
                {layout.elements["exp-1-en"]?.text !== undefined
                  ? <EditableParagraphs value={layout.elements["exp-1-en"].text ?? ""} />
                  : <>
                    <p>Beijing Good for All</p>
                    <p>Project Assistant <span className="about-coordinate-punctuation">&amp;</span> Visual Designer <span className="about-coordinate-punctuation">(</span>Intern<span className="about-coordinate-punctuation">)</span></p>
                  </>}
              </div>
              <div {...editorProps("exp-1-zh", true)} className={`about-coordinate-chinese${editMode ? " about-coordinate-editor-target" : ""}`} lang="zh-CN">
                <EditableParagraphs value={textValue("exp-1-zh", "项目助理&平面设计（实习）\n北京一切都好")} />
              </div>
            </div>
            <span {...editorProps("experience-divider")} className={`about-coordinate-rule about-coordinate-experience-divider${editMode ? " about-coordinate-editor-target" : ""}`} aria-hidden="true" />

            <div className="about-coordinate-row">
              <div {...editorProps("exp-2-date", true)} className={`about-coordinate-date${editMode ? " about-coordinate-editor-target" : ""}`} aria-label="25.02 至 now">
                <AboutDate value={textValue("exp-2-date", "25.02\nnow")} />
              </div>
              <div {...editorProps("exp-2-en", true)} className={`about-coordinate-english${editMode ? " about-coordinate-editor-target" : ""}`}>
                {layout.elements["exp-2-en"]?.text !== undefined
                  ? <EditableParagraphs value={layout.elements["exp-2-en"].text ?? ""} />
                  : <>
                    <p>JX Creative Studio</p>
                    <p>Visual Designer <span className="about-coordinate-punctuation">(</span>Part<span className="about-coordinate-punctuation">-</span>time<span className="about-coordinate-punctuation">)</span></p>
                  </>}
              </div>
              <div {...editorProps("exp-2-zh", true)} className={`about-coordinate-chinese${editMode ? " about-coordinate-editor-target" : ""}`} lang="zh-CN">
                <EditableParagraphs value={textValue("exp-2-zh", "平面设计（兼职）\n激星创意工作室")} />
              </div>
            </div>
          </section>
        </article>
      </div>

      {editMode ? (
        <>
          <aside className={`about-editor-toolbar${toolbarOpen ? "" : " is-collapsed"}`} aria-label="关于我页面布局编辑器">
            {!toolbarOpen ? (
              <button className="about-editor-open-button" type="button" onClick={() => setToolbarOpen(true)}>打开编辑器</button>
            ) : <>
              <header>
                <div><strong>ABOUT EDITOR</strong><span>仅保存在此浏览器</span></div>
                <nav><button type="button" onClick={() => setToolbarOpen(false)}>收起</button><a href="/about">退出编辑</a></nav>
              </header>
              <div className="about-editor-actions">
              <button type="button" onClick={undo}>撤销</button>
              <button type="button" onClick={redo}>恢复</button>
              <button type="button" onClick={resetLayout}>恢复默认</button>
              </div>
              <div className="about-editor-actions">
              <button type="button" onClick={exportLayout}>导出布局 JSON</button>
              <button type="button" onClick={() => importRef.current?.click()}>导入布局 JSON</button>
              <input ref={importRef} type="file" accept="application/json,.json" onChange={importLayout} hidden />
              </div>

            {selectedId ? (
              <div className="about-editor-inspector">
                <h3>{ELEMENT_LABELS[selectedId] ?? selectedId}</h3>
                <p className="about-editor-coordinate-readout">
                  X {selectionBox?.canvasX.toFixed(2) ?? "—"}% · Y {selectionBox?.canvasY.toFixed(2) ?? "—"}%<br />
                  W {selectionBox ? ((selectionBox.width / viewportWidth) * 100).toFixed(2) : "—"}vw · H {selectionBox ? ((selectionBox.height / viewportWidth) * 100).toFixed(2) : "—"}vw
                </p>
                <div className="about-editor-fields">
                  <label>宽度 vw<input type="number" step="0.1" value={numericValue("width")} onChange={(event) => updateNumber("width", event.target.value)} /></label>
                  <label>高度 vw<input type="number" step="0.1" value={numericValue("height")} onChange={(event) => updateNumber("height", event.target.value)} /></label>
                  <label>旋转 °<input type="number" step="1" value={numericValue("rotate")} onChange={(event) => updateNumber("rotate", event.target.value)} /></label>
                  <label>字号 vw<input type="number" step="0.05" value={numericValue("fontSize")} onChange={(event) => updateNumber("fontSize", event.target.value)} /></label>
                  <label>行距<input type="number" step="0.05" value={numericValue("lineHeight", 1)} onChange={(event) => updateNumber("lineHeight", event.target.value)} /></label>
                  <label>字距 em<input type="number" step="0.01" value={numericValue("letterSpacing")} onChange={(event) => updateNumber("letterSpacing", event.target.value)} /></label>
                </div>
                <label className="about-editor-select">字体
                  <select value={selectedElement.fontFamily ?? ""} onChange={(event) => selectedId && setElement(selectedId, { fontFamily: event.target.value || undefined })}>
                    <option value="">原始字体</option>
                    <option value="About Condensed">窄体英文</option>
                    <option value="About Chinese">中文字体</option>
                    <option value="cursive">手写风格</option>
                  </select>
                </label>
                <div className="about-editor-toggle-row">
                  <button type="button" className={(selectedElement.fontWeight ?? Number(selectedComputed?.fontWeight)) >= 700 ? "is-active" : ""} onClick={() => selectedId && setElement(selectedId, { fontWeight: (selectedElement.fontWeight ?? Number(selectedComputed?.fontWeight)) >= 700 ? 400 : 700 })}>粗体</button>
                  {(["left", "center", "right"] as TextAlign[]).map((align) => (
                    <button key={align} type="button" className={(selectedElement.textAlign ?? selectedComputed?.textAlign) === align ? "is-active" : ""} onClick={() => selectedId && setElement(selectedId, { textAlign: align })}>{align === "left" ? "左" : align === "center" ? "中" : "右"}</button>
                  ))}
                </div>
                {LINE_IDS.has(selectedId) ? (
                  <div className="about-editor-line-controls">
                    <label>线型
                      <select value={selectedElement.lineStyle ?? "solid"} onChange={(event) => setElement(selectedId, { lineStyle: event.target.value as LineStyle })}>
                        <option value="solid">实线</option>
                        <option value="dashed">虚线</option>
                        <option value="dotted">点线</option>
                      </select>
                    </label>
                    <label>粗细 px<input type="number" min="1" max="12" step="1" value={selectedElement.lineThickness ?? 1} onChange={(event) => updateNumber("lineThickness", event.target.value)} /></label>
                  </div>
                ) : null}
              </div>
            ) : <p className="about-editor-empty">点击元素进行选择和拖动。<br />双击文字可直接编辑并手动换行。</p>}
              <footer>{status}</footer>
            </>}
          </aside>

          {selectedId && selectionBox ? (
            <div className="about-editor-selection" style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height }}>
              <span className="about-editor-selection-label">{ELEMENT_LABELS[selectedId] ?? selectedId} · {selectionBox.canvasX.toFixed(1)}, {selectionBox.canvasY.toFixed(1)}</span>
              <button className="about-editor-rotate-handle" type="button" aria-label="旋转元素" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); startManipulation("rotate", selectedId, event.clientX, event.clientY); }} />
              <button className="about-editor-resize-handle" type="button" aria-label="调整元素尺寸" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); startManipulation("resize", selectedId, event.clientX, event.clientY); }} />
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
