import type { Metadata } from "next";
import { ShipmentList } from "@/components/shipment/shipment-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { requireRole } from "@/lib/auth";
import { listBranches, listShipments } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Tüm Gönderiler" };

export default async function AdminShipments({ searchParams }: PageProps<"/yonetici/gonderiler">) {
  await requireRole("yonetici");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toUpperCase() : "";
  const durum = typeof sp.durum === "string" ? sp.durum : "";
  const sube = typeof sp.sube === "string" ? sp.sube : "";

  const items = listShipments().filter(
    (s) =>
      (!q || s.trackingNo.includes(q) || s.receiver.name.toUpperCase().includes(q) || s.sender.name.toUpperCase().includes(q)) &&
      (!durum || s.status === durum) &&
      (!sube || s.originBranchId === sube || s.destBranchId === sube),
  );

  return (
    <>
      <PageHeader title="Tüm Gönderiler" description={`${items.length} gönderi listeleniyor`} />
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_200px_220px_auto]" role="search">
        <label className="sr-only" htmlFor="q">Ara</label>
        <Input id="q" name="q" defaultValue={q} placeholder="Takip no veya ad ile ara" />
        <label className="sr-only" htmlFor="durum">Durum</label>
        <Select id="durum" name="durum" defaultValue={durum}>
          <option value="">Tüm durumlar</option>
          {(Object.keys(STATUS_LABEL) as ShipmentStatus[]).map((k) => (
            <option key={k} value={k}>{STATUS_LABEL[k]}</option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="sube">Şube</label>
        <Select id="sube" name="sube" defaultValue={sube}>
          <option value="">Tüm şubeler</option>
          {listBranches().filter((b) => b.type === "sube").map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
        <Button type="submit">Filtrele</Button>
      </form>
      <ShipmentList items={items} hrefOf={(s) => `/takip/${s.trackingNo}`} emptyTitle="Sonuç yok" emptyText="Filtreleri değiştirerek tekrar deneyin." />
    </>
  );
}
