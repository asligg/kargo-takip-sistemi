import { CalendarClock, CalendarCog, MapPin, Package, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { SpeakButton } from "@/components/a11y/speak-button";
import { AutoRefresh } from "@/components/auto-refresh";
import { GreenInfo, PrefBadge } from "@/components/shipment/delivery-pref";
import { RouteMapLazy } from "@/components/shipment/route-map-lazy";
import { StatusBadge } from "@/components/shipment/status-badge";
import { ProgressSteps, StatusTimeline } from "@/components/shipment/status-timeline";
import { TrackForm } from "@/components/shipment/track-form";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { getBranch, getShipment } from "@/lib/data";
import { canEditPref } from "@/lib/delivery-pref";
import { formatDate, maskName, normalizeTrackingNo } from "@/lib/format";
import { routePoints } from "@/lib/route";
import { shipmentSpeech } from "@/lib/speech";

export async function generateMetadata({ params }: PageProps<"/takip/[no]">): Promise<Metadata> {
  const { no } = await params;
  return { title: `Kargo Takip · ${normalizeTrackingNo(no)}` };
}

/** Takip numarası ile üyeliksiz sorgulama sonucu (FR-08, FR-09, FR-10, NFR-09) */
export default async function TrackingPage({ params }: PageProps<"/takip/[no]">) {
  const { no: raw } = await params;
  const no = normalizeTrackingNo(decodeURIComponent(raw));
  const s = getShipment(no);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 max-w-xl">
        <TrackForm size="md" defaultValue={no} />
      </div>

      {!s ? (
        <EmptyState
          icon={<SearchX size={40} />}
          title="Gönderi bulunamadı"
          description={`"${no}" numaralı bir gönderi bulunamadı. Takip numarasını kontrol edip tekrar deneyin.`}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Takip numarası</p>
                  <p className="font-mono text-2xl font-bold tracking-wide text-slate-900">{s.trackingNo}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={s.status} />
                  <AutoRefresh />
                </div>
              </div>
              <div className="mt-8">
                <ProgressSteps shipment={s} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <SpeakButton text={shipmentSpeech(s)} />
                {canEditPref(s) && (
                  <LinkButton href={`/teslimat-yonet/${s.trackingNo}`} variant="outline" size="sm">
                    <CalendarCog size={16} aria-hidden /> Alıcı mısınız? Teslimatı yönetin
                  </LinkButton>
                )}
                <PrefBadge s={s} />
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <Card>
                <CardHeader title="Gönderi rotası" description="Gönderinin geçtiği şubeler ve transfer merkezleri" />
                <CardBody>
                  <RouteMapLazy points={routePoints(s)} />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Gönderi hareketleri" />
                <CardBody>
                  <StatusTimeline shipment={s} />
                </CardBody>
              </Card>
            </div>

            <Card className="self-start">
              <CardHeader title="Gönderi bilgileri" />
              <CardBody>
                <dl className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <CalendarClock size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <dt className="text-slate-500">{s.status === "TESLIM_EDILDI" ? "Teslim tarihi" : "Tahmini teslim"}</dt>
                      <dd className="font-medium text-slate-900">{formatDate(s.status === "TESLIM_EDILDI" ? s.history.at(-1)!.date : s.estimatedDelivery)}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <dt className="text-slate-500">Çıkış → Varış</dt>
                      <dd className="font-medium text-slate-900">
                        {getBranch(s.originBranchId)?.city} → {getBranch(s.destBranchId)?.city}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Package size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <dt className="text-slate-500">Paket</dt>
                      <dd className="font-medium text-slate-900">
                        {s.pkg.type === "dosya" ? "Dosya" : "Koli"} · {s.pkg.desi} desi
                      </dd>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <dt className="text-slate-500">Gönderici</dt>
                    <dd className="font-medium text-slate-900">{maskName(s.sender.name)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Alıcı</dt>
                    <dd className="font-medium text-slate-900">{maskName(s.receiver.name)}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <GreenInfo s={s} />
                </div>
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  Kişisel verilerin korunması için ad bilgileri kısaltılarak gösterilir; adres ve telefon bilgileri paylaşılmaz.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
