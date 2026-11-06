"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Durum değişikliklerini sayfa yenilenmeden yansıtır (FR-10).
 * Arayüz aşamasında belirli aralıklarla sunucudan güncel veri istenir;
 * gerçekleştirim aşamasında Supabase Realtime ile anlık bildirime dönüştürülecektir.
 */
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  const [last, setLast] = useState<Date | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
        setLast(new Date());
      }
    }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);

  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-500" aria-live="off">
      <RefreshCw size={12} className="animate-spin [animation-duration:3s]" aria-hidden />
      Canlı takip açık{last && ` · son kontrol ${last.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
    </p>
  );
}
