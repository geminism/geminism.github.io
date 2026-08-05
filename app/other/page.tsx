import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";

export const metadata: Metadata = { title: "其他设计" };
export default function Page() { return <SectionPage id="other" />; }
