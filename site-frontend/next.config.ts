import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default Server Action body limit is 1MB — well under the
      // largest upload this app actually allows (banner images, up to
      // 6MB per src/lib/media/specs.ts). Without this, a valid upload
      // under our own size limit still got rejected by Next itself before
      // uploadImage() (src/lib/media/upload.ts) ever ran its own check.
      // 8mb leaves headroom above the 6MB ceiling for multipart overhead.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
