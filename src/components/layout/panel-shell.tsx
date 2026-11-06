"use client";

import {
  BarChart3,
  BookUser,
  Building2,
  FileBarChart,
  Home,
  List,
  LogOut,
  Menu,
  Package,
  Plus,
  ScanLine,
  Tag,
  Truck,
  User,
  Users,
  X,
} from "lucide-react";
import { A11yToggle } from "@/components/a11y/a11y-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { NavItem } from "@/lib/nav";
import { Logo } from "./logo";

const ICONS: Record<string, typeof Home> = {
  package: Package,
  plus: Plus,
  book: BookUser,
  user: User,
  home: Home,
  scan: ScanLine,
  truck: Truck,
  list: List,
  chart: BarChart3,
  building: Building2,
  users: Users,
  tag: Tag,
  report: FileBarChart,
};

interface Props {
  nav: NavItem[];
  userName: string;
  roleLabel: string;
  subtitle?: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

/** Rol bazlı panel iskeleti: kenar menü + üst çubuk (mobilde açılır menü) */
export function PanelShell({ nav, userName, roleLabel, subtitle, logoutAction, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || (href !== nav[0]?.href && pathname.startsWith(href + "/"));

  const menu = (
    <nav aria-label="Panel menüsü" className="flex-1 space-y-1 px-3 py-4">
      {nav.map((item) => {
        const Icon = ICONS[item.icon] ?? Package;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-brand-600 text-white" : "text-brand-100 hover:bg-brand-800 hover:text-white"
            }`}
          >
            <Icon size={18} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userBox = (
    <div className="border-t border-brand-800 p-4">
      <p className="truncate text-sm font-semibold text-white">{userName}</p>
      <p className="truncate text-xs text-brand-300">
        {roleLabel}
        {subtitle && ` · ${subtitle}`}
      </p>
      <form action={logoutAction} className="mt-3">
        <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100 hover:bg-brand-800 hover:text-white">
          <LogOut size={16} aria-hidden /> Çıkış Yap
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Masaüstü kenar menü */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-brand-900 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo light />
        </div>
        {menu}
        {userBox}
      </aside>

      {/* Mobil açılır menü */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Panel menüsü">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-900">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo light />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-brand-100 hover:bg-brand-800" aria-label="Menüyü kapat">
                <X size={20} />
              </button>
            </div>
            {menu}
            {userBox}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Menüyü aç">
            <Menu size={22} />
          </button>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{roleLabel} Paneli</span>
          <A11yToggle className="ml-auto" />
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Siteye dön
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
