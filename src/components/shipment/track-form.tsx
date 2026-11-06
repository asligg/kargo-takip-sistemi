"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRACKING_RE, normalizeTrackingNo } from "@/lib/format";

/** Takip numarası ile üyeliksiz sorgulama formu (FR-08) */
export function TrackForm({ size = "lg", defaultValue = "" }: { size?: "md" | "lg"; defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const no = normalizeTrackingNo(value);
    if (!no) return setError("Lütfen takip numaranızı girin.");
    if (!TRACKING_RE.test(no)) return setError("Takip numarası 'KT' ile başlayan 12 karakterden oluşmalıdır (ör. KT2026110301).");
    setError("");
    router.push(`/takip/${no}`);
  }

  const big = size === "lg";
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor="trackingNo" className="sr-only">
        Takip numarası
      </label>
      <div className={`flex gap-2 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 ${big ? "sm:p-2" : ""}`}>
        <input
          id="trackingNo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Takip numaranızı girin (ör. KT2026110301)"
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? "trackingNo-error" : undefined}
          className={`min-w-0 flex-1 rounded-lg px-3 font-mono uppercase tracking-wide text-slate-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none ${big ? "h-12 text-base" : "h-10 text-sm"}`}
        />
        <button
          type="submit"
          className={`inline-flex items-center gap-2 rounded-lg bg-accent-500 font-semibold text-slate-900 transition-colors hover:bg-accent-400 ${big ? "h-12 px-5" : "h-10 px-4 text-sm"}`}
        >
          <Search size={18} aria-hidden />
          <span className="hidden sm:inline">Sorgula</span>
        </button>
      </div>
      {error && (
        <p id="trackingNo-error" role="alert" className="mt-2 rounded-md bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
          {error}
        </p>
      )}
    </form>
  );
}
