import { ArrowLeft, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeliveryPrefCard } from "@/components/shipment/delivery-pref";
import { StatusBadge } from "@/components/shipment/status-badge";
import { Card, CardBody, EmptyState } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { getBranch, getShipment } from "@/lib/data";
import { formatDate, maskName, normalizeTrackingNo } from "@/lib/format";

export const metadata: Metadata = { title: "Teslimatı Yönet" };

/**
 * Alıcı kontrolü ("Kargom yolda, planım değişti"): alıcıya giden e-postadaki bağlantı bu sayfayı açar.
 * Üye olmayan alıcı, tercihini telefon numarasının son 4 hanesiyle doğrulayarak değiştirir.
 */
export default async function ManageDeliveryPage({ params }: PageProps<"/teslimat-yonet/[no]">) {
  const { no: raw } = await params;
  const no = normalizeTrackingNo(decodeURIComponent(raw));
  const s = getShipment(no);
  const user = await getSessionUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/takip/${no}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} aria-hidden /> Takip sayfasına dön
      </Link>
      {!s ? (
        <EmptyState icon={<SearchX size={40} />} title="Gönderi bulunamadı" description={`"${no}" numaralı bir gönderi bulunamadı.`} />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teslimatı yönet</h1>
            <p className="mt-1 text-sm text-slate-500">Evde olmayacak mısınız? Kargonuzun nasıl ve ne zaman teslim edileceğini siz seçin.</p>
          </div>
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-bold text-slate-900">{s.trackingNo}</p>
                <p className="text-sm text-slate-500">
                  Alıcı: {maskName(s.receiver.name)} · Varış: {getBranch(s.destBranchId)?.name} · Tahmini teslim: {formatDate(s.estimatedDelivery)}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </CardBody>
          </Card>
          <DeliveryPrefCard s={s} requireLast4={!(user?.role === "musteri" && user.email.toLowerCase() === s.receiver.email?.toLowerCase())} />
        </div>
      )}
    </div>
  );
}
