import type { Metadata } from "next";
import { PackagingDesignPage } from "@/components/PackagingDesignPage";

export const metadata: Metadata = { title: "包装设计" };
export default function Page() { return <PackagingDesignPage />; }
