import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Assets in public/ are already sized and compressed for the web, so we
    // serve them straight from Cloudflare's static assets instead of routing
    // them through the Worker's /_vinext/image optimizer. That optimizer needs
    // the Cloudflare Images binding, which has to be enabled separately on the
    // account — see README「圖片」.
    unoptimized: true,
  },
};

export default nextConfig;
