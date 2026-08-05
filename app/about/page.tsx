import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";

export const metadata: Metadata = { title: "关于我" };
export default function Page() { return <SectionPage id="about" />; }
