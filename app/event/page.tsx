import type { Metadata } from "next";
import { SectionPage } from "@/components/SectionPage";

export const metadata: Metadata = { title: "活动设计" };
export default function Page() { return <SectionPage id="event" />; }
