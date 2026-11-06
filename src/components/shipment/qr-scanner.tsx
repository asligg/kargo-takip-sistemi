"use client";

import { Camera, CameraOff, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { TRACKING_RE, normalizeTrackingNo } from "@/lib/format";

/**
 * QR kod okuyucu (FR-12). Telefon/bilgisayar kamerasıyla paket üzerindeki QR kodu okur;
 * kamera kullanılamazsa takip numarası elle girilebilir.
 */
export function QrScanner({ onResult }: { onResult: (trackingNo: string) => void }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const regionId = "qr-okuyucu";

  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (text) => {
            const no = normalizeTrackingNo(text);
            if (TRACKING_RE.test(no)) {
              setCameraOn(false);
              onResult(no);
            }
          },
          () => {},
        );
      } catch {
        setError("Kameraya erişilemedi. Tarayıcı izinlerini kontrol edin veya takip numarasını elle girin.");
        setCameraOn(false);
      }
    })();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      // Kamera hiç başlamadıysa stop() eşzamanlı hata fırlatır; bu yüzden try ile sarılır
      try {
        s?.stop().then(() => s.clear()).catch(() => {});
      } catch {
        // tarayıcı zaten çalışmıyor
      }
    };
  }, [cameraOn, onResult]);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const no = normalizeTrackingNo(manual);
    if (!TRACKING_RE.test(no)) return setError("Geçerli bir takip numarası girin (ör. KT2026110301).");
    setError("");
    onResult(no);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl bg-slate-900">
        {cameraOn ? (
          <div id={regionId} className="mx-auto aspect-square max-w-sm" />
        ) : (
          <div className="flex aspect-[4/3] max-h-72 w-full flex-col items-center justify-center gap-3 text-slate-300">
            <Camera size={40} aria-hidden />
            <p className="px-6 text-center text-sm">Paketin üzerindeki QR kodu okutmak için kamerayı başlatın.</p>
          </div>
        )}
      </div>
      <Button type="button" variant={cameraOn ? "outline" : "primary"} className="w-full" onClick={() => { setError(""); setCameraOn(!cameraOn); }}>
        {cameraOn ? <><CameraOff size={18} aria-hidden /> Kamerayı Kapat</> : <><Camera size={18} aria-hidden /> Kamerayı Başlat</>}
      </Button>

      <form onSubmit={submitManual} className="rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor="manual-no" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Keyboard size={16} aria-hidden /> veya takip numarasını elle girin
        </label>
        <div className="flex gap-2">
          <Input id="manual-no" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="KT2026110301" className="font-mono uppercase" />
          <Button type="submit" variant="outline">
            Getir
          </Button>
        </div>
      </form>
      {error && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
