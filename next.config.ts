import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only. All portfolio routes are
  // client-rendered/static, so export them as HTML for Pages hosting.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
