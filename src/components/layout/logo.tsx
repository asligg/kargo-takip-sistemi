import { Leaf, Package } from "lucide-react";
import Link from "next/link";

/** Yeşil Kargo logosu: koli simgesi ve köşesinde küçük bir yaprak */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white ${className}`} aria-hidden>
      <Package size={20} strokeWidth={2.2} />
      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-400 text-brand-900 ring-2 ring-white">
        <Leaf size={12} strokeWidth={2.6} />
      </span>
    </span>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight" aria-label="Yeşil Kargo ana sayfa">
      <LogoMark />
      <span className={light ? "text-white" : "text-brand-800"}>
        Yeşil<span className={light ? "text-accent-400" : "text-brand-500"}>Kargo</span>
      </span>
    </Link>
  );
}
