import { ArrowLeft, MapPin, Navigation, Package, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeliverForm, FailDeliveryForm } from "@/components/forms/delivery-forms";
import { PrefBadge } from "@/components/shipment/delivery-pref";
import { StatusBadge } from "@/components/shipment/status-badge";
import { Alert, Card, CardBody, CardHeader, EmptyState, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { googleMapsTo, stopOf } from "@/lib/courier-route";
import { demoDeliveryCode, getBranch, getShipment } from "@/lib/data";

export const metadata: Metadata = { title: "Teslimat" };

/** Doğrulama kodlu teslimat (UC-03, FR-15, FR-16) */
export default async function DeliveryPage({ params }: PageProps<"/kurye/teslimat/[no]">) {
  const user = await requireRole("kurye");
  const { no } = await params;
  const s = getShipment(no);

  if (!s || s.courierId !== user.id) {
    return (
      <EmptyState
        title="Bu gönderi size atanmamış"
        description="Yalnızca size atanan gönderilerin teslimatını yapabilirsiniz. Şube yetkilinizle iletişime geçin."
        action={
          <Link href="/kurye" className="font-medium text-brand-700 hover:underline">
            Atanan gönderilere dön
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/kurye" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} aria-hidden /> Atanan gönderiler
      </Link>
      <PageHeader title={s.trackingNo} action={<StatusBadge status={s.status} />} />

      <Card className="mb-6">
        <CardHeader title="Alıcı" />
        <CardBody className="space-y-2 text-sm">
          <p className="text-base font-semibold text-slate-900">{s.receiver.name}</p>
          {s.deliveryPref?.option === "KOMSU" && (
            <Alert tone="info">
              Alıcı evde yoksa kargo komşuya bırakılabilir: <strong>{s.deliveryPref.neighbor}</strong>. Doğrulama kodunu komşudan alın.
            </Alert>
          )}
          {s.deliveryPref && s.deliveryPref.option !== "KOMSU" && <PrefBadge s={s} detail />}
          <p className="flex gap-2 text-slate-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
            {s.receiver.address}, {s.receiver.district}/{s.receiver.city}
          </p>
          {s.status === "DAGITIMDA" && (
            <a
              href={googleMapsTo(stopOf(s, getBranch(s.destBranchId)!))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Navigation size={16} aria-hidden /> Bu adrese navigasyon
            </a>
          )}
          <a href={`tel:${s.receiver.phone.replace(/\s/g, "")}`} className="flex gap-2 font-medium text-brand-700">
            <Phone size={16} className="mt-0.5 shrink-0" aria-hidden />
            {s.receiver.phone}
          </a>
          <p className="flex gap-2 text-slate-700">
            <Package size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
            {s.pkg.type === "dosya" ? "Dosya" : "Koli"} · {s.pkg.weightKg} kg
          </p>
        </CardBody>
      </Card>

      {s.status === "DAGITIMDA" ? (
        <Card>
          <CardHeader title="Teslimatı tamamla" description="Alıcıdan, e-postasına gönderilen 6 haneli kodu isteyin." />
          <CardBody className="space-y-4">
            <DeliverForm trackingNo={s.trackingNo} demoCode={demoDeliveryCode(s.trackingNo)} />
            <div className="relative py-2 text-center text-xs text-slate-400">
              <span className="relative z-10 bg-white px-2">teslim edilemiyorsa</span>
              <span className="absolute inset-x-0 top-1/2 border-t border-slate-200" aria-hidden />
            </div>
            <FailDeliveryForm trackingNo={s.trackingNo} />
          </CardBody>
        </Card>
      ) : (
        <Alert tone={s.status === "TESLIM_EDILDI" ? "success" : "warning"}>
          Bu gönderi için işlem tamamlandı: {s.status === "TESLIM_EDILDI" ? "teslim edildi" : s.history.at(-1)?.note ?? "teslim edilemedi"}.
        </Alert>
      )}
    </div>
  );
}
