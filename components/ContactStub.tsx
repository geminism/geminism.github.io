"use client";

import { useEffect, useState } from "react";

export function ContactStub() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button className="contact-trigger" type="button" onClick={() => setOpen(true)} aria-expanded={open}>
        Contact
      </button>
      {open && (
        <div className="contact-scrim" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="contact-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="contact-close" type="button" aria-label="关闭联系方式" onClick={() => setOpen(false)}>
              ×
            </button>
            <p className="eyebrow">Fixed entrance · Prototype</p>
            <h2 id="contact-title">联系方式</h2>
            <p>这里暂时只验证第六个固定入口的位置和层级，最终形式及联系内容将在下一阶段确定。</p>
          </section>
        </div>
      )}
    </>
  );
}
