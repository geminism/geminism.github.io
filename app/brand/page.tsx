import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";

export const metadata: Metadata = { title: "品牌设计" };
export default function Page() { return <SectionPage id="brand" />; }
