import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContactStub } from "./ContactStub";
import { getSection, SectionId } from "@/lib/sections";

export function SectionPage({ id }: { id: SectionId }) {
  const section = getSection(id)!;
  const style = { "--section-color": section.color } as CSSProperties;

  return (
    <main className="section-page" style={style}>
      <Link className="section-back" href="/" aria-label="返回路牌首页">← Index</Link>
      <div className="section-stage">
        <section className="section-copy">
          <p className="eyebrow">Independent section · Prototype</p>
          <h1>{section.zh}<span>{section.en}</span></h1>
          <p className="section-note">该独立页面的入口和返回路径已经建立。项目列表、案例内容与版式将在下一阶段根据实际作品素材设计。</p>
        </section>
        <Image className="section-sign" src={section.image} width={2048} height={2048} alt={`${section.zh}路牌`} priority />
      </div>
      <ContactStub />
    </main>
  );
}
