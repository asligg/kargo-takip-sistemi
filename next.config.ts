import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oturum çerezine bağlı paneller her istekte sunucuda üretilir; bu nedenle
  // Cache Components yerine klasik (istek bazlı) önbellek modeli kullanılır.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
