"use client";

import { Accessibility } from "lucide-react";
import { useSyncExternalStore } from "react";
import { A11Y_KEY } from "@/lib/a11y";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setMode(on: boolean) {
  document.documentElement.classList.toggle("a11y", on);
  try {
    localStorage.setItem(A11Y_KEY, on ? "1" : "0");
  } catch {
    // gizli pencere vb. — tercih yalnızca bu sayfa için geçerli olur
  }
  listeners.forEach((l) => l());
}

/** Erişilebilir mod: büyük yazı, yüksek kontrast, belirgin bağlantılar. Tercih tarayıcıda saklanır. */
export function A11yToggle({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  const on = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("a11y"),
    () => false,
  );

  return (
    <button
      type="button"
      onClick={() => setMode(!on)}
      aria-pressed={on}
      title={on ? "Erişilebilir modu kapat" : "Erişilebilir mod: büyük yazı ve yüksek kontrast"}
      className={`inline-flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-slate-100 ${on ? "bg-brand-50 text-brand-800 ring-1 ring-brand-300" : "text-slate-600"} ${className}`}
    >
      <Accessibility size={20} aria-hidden />
      <span className={showLabel ? "" : "sr-only"}>{on ? "Erişilebilir mod açık" : "Erişilebilir mod"}</span>
    </button>
  );
}
