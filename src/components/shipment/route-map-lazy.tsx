"use client";

import dynamic from "next/dynamic";
import type { RoutePoint } from "./route-map";

// Leaflet tarayıcıdaki window nesnesine ihtiyaç duyduğundan sunucuda çalıştırılmaz.
const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 sm:h-80">Harita yükleniyor…</div>,
});

export function RouteMapLazy({ points }: { points: RoutePoint[] }) {
  return <RouteMap points={points} />;
}
