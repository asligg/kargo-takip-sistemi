"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { QrScanner } from "./qr-scanner";

/** QR okutulunca ilgili gönderi sayfasına yönlendirir */
export function ScanAndGo({ basePath }: { basePath: string }) {
  const router = useRouter();
  const go = useCallback((no: string) => router.push(`${basePath}/${no}`), [router, basePath]);
  return <QrScanner onResult={go} />;
}
