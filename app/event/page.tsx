import type { Metadata } from "next";
import { EventDesignPage } from "@/components/EventDesignPage";

export const metadata: Metadata = { title: "活动设计" };
export default function Page() { return <EventDesignPage />; }
