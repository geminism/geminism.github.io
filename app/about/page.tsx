import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";

export const metadata: Metadata = { title: "关于我" };
export default function Page() { return <AboutPage />; }
