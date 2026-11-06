import { ChevronRight, PackageOpen } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/card";
import { getBranch } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Shipment } from "@/lib/types";
import { StatusBadge } from "./status-badge";

/** Gönderi listesi: masaüstünde tablo, mobilde kart görünümü */
export function ShipmentList({
  items,
  hrefOf,
  party = "receiver",
  emptyTitle = "Gönderi bulunamadı",
  emptyText,
}: {
  items: Shipment[];
  hrefOf: (s: Shipment) => string;
  party?: "receiver" | "sender";
  emptyTitle?: string;
  emptyText?: string;
}) {
  if (items.length === 0) return <EmptyState icon={<PackageOpen size={36} />} title={emptyTitle} description={emptyText} />;
  const partyLabel = party === "receiver" ? "Alıcı" : "Gönderici";

  return (
    <>
      {/* Masaüstü */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Takip No</th>
              <th className="px-4 py-3">{partyLabel}</th>
              <th className="px-4 py-3">Güzergâh</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">
                <span className="sr-only">Detay</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((s) => (
              <tr key={s.trackingNo} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-slate-900">{s.trackingNo}</td>
                <td className="px-4 py-3">{s[party].name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {getBranch(s.originBranchId)?.city} → {getBranch(s.destBranchId)?.city}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={hrefOf(s)} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                    Detay <ChevronRight size={16} aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil */}
      <ul className="space-y-3 md:hidden">
        {items.map((s) => (
          <li key={s.trackingNo}>
            <Link href={hrefOf(s)} className="block rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono font-semibold text-slate-900">{s.trackingNo}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {partyLabel}: {s[party].name}
              </p>
              <p className="text-sm text-slate-500">
                {getBranch(s.originBranchId)?.city} → {getBranch(s.destBranchId)?.city} · {formatDate(s.createdAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
