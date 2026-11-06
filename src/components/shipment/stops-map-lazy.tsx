"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type StopsMapType from "./stops-map";

// Leaflet tarayıcıdaki window nesnesine ihtiyaç duyduğundan sunucuda çalıştırılmaz.
const StopsMap = dynamic(() => import("./stops-map"), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">Harita yükleniyor…</div>,
});

export function StopsMapLazy(props: ComponentProps<typeof StopsMapType>) {
  return <StopsMap {...props} />;
}
