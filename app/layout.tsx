import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Design Portfolio",
    template: "%s — Design Portfolio",
  },
  description: "A spatial portfolio for brand, packaging, event and other design work.",
  icons: {
    icon: "/signs/about.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
