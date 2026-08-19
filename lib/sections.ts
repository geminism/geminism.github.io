export type SectionId = "about" | "brand" | "packaging" | "event" | "other";
export type HomeTargetId = SectionId | "contact";

export type PortfolioSection = {
  id: SectionId;
  zh: string;
  en: string;
  href: string;
  image: string;
  color: string;
};

export const sections: PortfolioSection[] = [
  { id: "about", zh: "关于我", en: "About Me", href: "/about", image: "/signs/about.png", color: "#ff5b54" },
  { id: "brand", zh: "品牌设计", en: "Brand Design", href: "/brand", image: "/signs/brand.png", color: "#58c461" },
  { id: "packaging", zh: "包装设计", en: "Packaging Design", href: "/packaging", image: "/signs/packaging.png", color: "#f7eb73" },
  { id: "event", zh: "活动设计", en: "Event Design", href: "/event", image: "/signs/event.png", color: "#47a5e8" },
  { id: "other", zh: "其他设计", en: "Other Design", href: "/other", image: "/signs/other.png", color: "#ff74c8" },
];

export function getSection(id: string) {
  return sections.find((section) => section.id === id);
}
