import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The map/filters screens' pin icons are our own trusted static SVGs
    // under /public/pins (no user-uploaded SVGs are ever served this way),
    // so it's safe to let next/image optimize them.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
