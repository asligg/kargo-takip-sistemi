import { getBranch, getUser } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatTL } from "@/lib/price";
import type { Party, Shipment } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { LabelData } from "./qr-label";
import { StatusBadge } from "./status-badge";
import { StatusTimeline } from "./status-timeline";

export function labelData(s: Shipment): LabelData {
  return {
    trackingNo: s.trackingNo,
    senderName: s.sender.name,
    senderCity: s.sender.city,
    receiverName: s.receiver.name,
    receiverAddress: `${s.receiver.address}, ${s.receiver.district}`,
    receiverCity: s.receiver.city,
    receiverPhone: s.receiver.phone,
    originBranch: getBranch(s.originBranchId)?.city ?? "",
    destBranch: getBranch(s.destBranchId)?.name ?? "",
    weight: `${s.pkg.weightKg} kg · ${s.pkg.desi} desi`,
  };
}

function PartyBlock({ title, p }: { title: string; p: Party }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 font-medium text-slate-900">{p.name}</p>
      <p className="text-sm text-slate-600">{p.phone}</p>
      {p.email && <p className="text-sm text-slate-600">{p.email}</p>}
      <p className="mt-1 text-sm text-slate-600">
        {p.address}, {p.district}/{p.city}
      </p>
    </div>
  );
}

/** Yetkili kullanıcılar için tam gönderi bilgisi (müşteri, şube, yönetici ekranlarında ortak) */
export function ShipmentInfo({ s }: { s: Shipment }) {
  const courier = s.courierId ? getUser(s.courierId) : undefined;
  return (
    <Card>
      <CardHeader title="Gönderi bilgileri" action={<StatusBadge status={s.status} />} />
      <CardBody className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <PartyBlock title="Gönderici" p={s.sender} />
          <PartyBlock title="Alıcı" p={s.receiver} />
        </div>
        <dl className="grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Paket</dt>
            <dd className="font-medium text-slate-900">
              {s.pkg.type === "dosya" ? "Dosya" : "Koli"} · {s.pkg.weightKg} kg · {s.pkg.desi} desi
            </dd>
            {s.pkg.description && <dd className="text-slate-600">{s.pkg.description}</dd>}
          </div>
          <div>
            <dt className="text-slate-500">Çıkış → Varış şubesi</dt>
            <dd className="font-medium text-slate-900">
              {getBranch(s.originBranchId)?.name} → {getBranch(s.destBranchId)?.name}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Ücret</dt>
            <dd className="font-medium text-slate-900">{formatTL(s.price)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Oluşturulma</dt>
            <dd className="font-medium text-slate-900">{formatDateTime(s.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tahmini teslim</dt>
            <dd className="font-medium text-slate-900">{formatDate(s.estimatedDelivery)}</dd>
          </div>
          {courier && (
            <div>
              <dt className="text-slate-500">Kurye</dt>
              <dd className="font-medium text-slate-900">{courier.name}</dd>
            </div>
          )}
        </dl>
      </CardBody>
    </Card>
  );
}

export function ShipmentHistory({ s }: { s: Shipment }) {
  return (
    <Card>
      <CardHeader title="Gönderi hareketleri" />
      <CardBody>
        <StatusTimeline shipment={s} />
      </CardBody>
    </Card>
  );
}
