import { Leaf, Plus } from "lucide-react";
import type { Metadata } from "next";
import { ShipmentList } from "@/components/shipment/shipment-list";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { formatTL } from "@/lib/price";
import { POINTS_PER_TL } from "@/lib/green";
import { requireRole } from "@/lib/auth";
import { listCustomerShipments } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Kargolarım" };

const TABS = [
  { key: "giden", label: "Gönderdiklerim" },
  { key: "gelen", label: "Bana Gelenler" },
] as const;

/** "Kargolarım" ekranı: gönderilen ve gelen gönderiler (FR-11) */
export default async function MyShipmentsPage({ searchParams }: PageProps<"/musteri">) {
  const user = await requireRole("musteri");
  const sp = await searchParams;
  const tab = sp.sekme === "gelen" ? "gelen" : "giden";
  const filter = typeof sp.durum === "string" && sp.durum in STATUS_LABEL ? (sp.durum as ShipmentStatus) : undefined;

  const { sent, incoming } = listCustomerShipments(user);
  const base = tab === "gelen" ? incoming : sent;
  const items = filter ? base.filter((s) => s.status === filter) : base;
  const statuses = [...new Set(base.map((s) => s.status))];

  return (
    <>
      <PageHeader
        title="Kargolarım"
        description={`Hoş geldiniz ${user.name.split(" ")[0]}. Gönderdiğiniz ve size gelen tüm kargolar burada.`}
        action={
          <LinkButton href="/musteri/gonderi-olustur">
            <Plus size={16} aria-hidden /> Gönderi Oluştur
          </LinkButton>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Leaf size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-emerald-900">
            Yeşil puanınız: {user.greenPoints ?? 0} <span className="font-normal text-emerald-700">(≈ {formatTL(Math.floor((user.greenPoints ?? 0) / POINTS_PER_TL))} indirim)</span>
          </p>
          <p className="text-sm text-emerald-800">
            Size gelen kargoları şubeden alarak (+15) veya yeşil teslimat gününü seçerek (+10) puan kazanın; puanlarınızı gönderi oluştururken indirim olarak kullanın.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Gönderi türü" className="inline-flex rounded-lg bg-slate-200/70 p-1">
          {TABS.map((t) => {
            const count = t.key === "gelen" ? incoming.length : sent.length;
            return (
              <Link
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                href={`/musteri?sekme=${t.key}`}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 aria-selected:bg-white aria-selected:text-slate-900 aria-selected:shadow-sm"
              >
                {t.label} <span className="ml-1 text-xs text-slate-400">{count}</span>
              </Link>
            );
          })}
        </div>
        {statuses.length > 1 && (
          <nav aria-label="Duruma göre filtrele" className="flex flex-wrap gap-2">
            <Link
              href={`/musteri?sekme=${tab}`}
              aria-current={!filter ? "true" : undefined}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 aria-[current]:border-brand-600 aria-[current]:bg-brand-600 aria-[current]:text-white"
            >
              Tümü
            </Link>
            {statuses.map((st) => (
              <Link
                key={st}
                href={`/musteri?sekme=${tab}&durum=${st}`}
                aria-current={filter === st ? "true" : undefined}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 aria-[current]:border-brand-600 aria-[current]:bg-brand-600 aria-[current]:text-white"
              >
                {STATUS_LABEL[st]}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <ShipmentList
        items={items}
        party={tab === "gelen" ? "sender" : "receiver"}
        hrefOf={(s) => `/musteri/gonderi/${s.trackingNo}`}
        emptyTitle={tab === "gelen" ? "Size gelen gönderi yok" : "Henüz gönderi oluşturmadınız"}
        emptyText={tab === "gelen" ? "E-posta adresinize kayıtlı gönderiler otomatik olarak burada listelenir." : "İlk gönderinizi oluşturmak için 'Gönderi Oluştur' düğmesini kullanın."}
      />
    </>
  );
}
