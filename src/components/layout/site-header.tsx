"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { A11yToggle } from "@/components/a11y/a11y-toggle";
import { buttonClass } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { Logo } from "./logo";

const noopSubscribe = () => () => {};

/** Oturum açık mı? (yalnızca menüdeki bağlantıyı seçmek için; yetki kontrolü sunucuda yapılır) */
function usePanelHref(): string | undefined {
  const role = useSyncExternalStore(
    noopSubscribe,
    () => document.cookie.match(/(?:^|; )kt_role=([^;]+)/)?.[1] as Role | undefined,
    () => undefined,
  );
  return role && ROLE_HOME[role] ? ROLE_HOME[role] : undefined;
}

const LINKS = [
  { href: "/", label: "Kargo Takip" },
  { href: "/ucret-hesapla", label: "Ücret Hesapla" },
  { href: "/subeler", label: "Şubeler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const panelHref = usePanelHref();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <A11yToggle />
          {panelHref ? (
            <Link href={panelHref} className={buttonClass("primary", "sm")}>
              Panelim
            </Link>
          ) : (
            <>
              <Link href="/giris" className={buttonClass("ghost", "sm")}>
                Giriş Yap
              </Link>
              <Link href="/kayit" className={buttonClass("primary", "sm")}>
                Üye Ol
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <A11yToggle />
          <button
            type="button"
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobil-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobil-menu" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobil menü">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {panelHref ? (
              <Link href={panelHref} className={buttonClass("primary", "md", "col-span-2")} onClick={() => setOpen(false)}>
                Panelim
              </Link>
            ) : (
              <>
                <Link href="/giris" className={buttonClass("outline")} onClick={() => setOpen(false)}>
                  Giriş Yap
                </Link>
                <Link href="/kayit" className={buttonClass("primary")} onClick={() => setOpen(false)}>
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
