import { Mail, PackageCheck, ScanLine, Store, Truck, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import { ShipmentList } from "@/components/shipment/shipment-list";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, PageHeader, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getBranch, listBranchShipments, listOutbox } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Şube Paneli" };

export default async function BranchHome() {
  const user = await requireRole("sube");
  const branch = getBranch(user.branchId!)!;
  const { here, awaitingAssign, awaitingPickup, outForDelivery } = listBranchShipments(branch.id);
  const mails = listOutbox().slice(0, 5);

  return (
    <>
      <PageHeader
        title={branch.name}
        description="Şubenizdeki gönderilerin güncel durumu"
        action={
          <LinkButton href="/sube/qr-okut" size="lg">
            <ScanLine size={18} aria-hidden /> QR Okut
          </LinkButton>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Şubede bekleyen" value={here.length} icon={<Warehouse size={18} />} hint="Kabul edilen / transfer bekleyen" />
        <StatCard label="Kuryeye atanacak" value={awaitingAssign.length} icon={<PackageCheck size={18} />} hint="Varış şubesine ulaşan" />
        <StatCard label="Şubeden teslim alınacak" value={awaitingPickup.length} icon={<Store size={18} />} hint="Alıcı şubeye gelecek" />
        <StatCard label="Dağıtımda" value={outForDelivery.length} icon={<Truck size={18} />} hint="Kuryelerde" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section aria-labelledby="h-here">
            <h2 id="h-here" className="mb-3 font-semibold text-slate-900">Şubedeki gönderiler</h2>
            <ShipmentList items={here} hrefOf={(s) => `/sube/gonderi/${s.trackingNo}`} emptyTitle="Şubede bekleyen gönderi yok" />
          </section>
          <section aria-labelledby="h-assign">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="h-assign" className="font-semibold text-slate-900">Kuryeye atanmayı bekleyenler</h2>
              {awaitingAssign.length > 0 && (
                <LinkButton href="/sube/kurye-atama" variant="outline" size="sm">
                  Kurye ata
                </LinkButton>
              )}
            </div>
            <ShipmentList items={awaitingAssign} hrefOf={(s) => `/sube/gonderi/${s.trackingNo}`} emptyTitle="Atanacak gönderi yok" />
          </section>
          <section aria-labelledby="h-pickup">
            <h2 id="h-pickup" className="mb-1 font-semibold text-slate-900">Şubeden teslim alınacaklar</h2>
            <p className="mb-3 text-sm text-slate-500">Alıcı &quot;şubeden kendim alacağım&quot; dedi. Alıcı geldiğinde gönderiyi açıp doğrulama koduyla teslim edin.</p>
            <ShipmentList items={awaitingPickup} hrefOf={(s) => `/sube/gonderi/${s.trackingNo}`} emptyTitle="Şubeden teslim bekleyen gönderi yok" />
          </section>
        </div>

        <Card className="self-start">
          <CardHeader title="Son gönderilen bildirimler" description="Durum güncellemelerinde alıcılara giden e-postalar" />
          <CardBody>
            {mails.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz bildirim gönderilmedi. Bir gönderinin durumunu güncellediğinizde burada görünür.</p>
            ) : (
              <ul className="space-y-3">
                {mails.map((m) => (
                  <li key={m.date + m.to} className="flex gap-3 text-sm">
                    <Mail size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">{m.to}</p>
                      <p className="text-slate-600">{m.subject}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(m.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
