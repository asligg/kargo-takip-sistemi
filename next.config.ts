import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oturum çerezine bağlı paneller her istekte sunucuda üretilir; bu nedenle
  // Cache Components yerine klasik (istek bazlı) önbellek modeli kullanılır.
  cacheComponents: false,
  // Geliştirme sırasında sol altta çıkan Next.js göstergesini gizler
  devIndicators: false,
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
