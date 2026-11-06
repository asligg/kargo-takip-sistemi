import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeakButton } from "@/components/a11y/speak-button";
import { RatingForm } from "@/components/forms/rating-form";
import { DeliveryPrefCard, GreenInfo } from "@/components/shipment/delivery-pref";
import { QrLabel } from "@/components/shipment/qr-label";
import { labelData, ShipmentHistory, ShipmentInfo } from "@/components/shipment/shipment-detail";
import { Alert, Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getShipment } from "@/lib/data";
import { shipmentSpeech } from "@/lib/speech";

export const metadata: Metadata = { title: "Gönderi Detayı" };

export default async function CustomerShipmentPage({ params, searchParams }: PageProps<"/musteri/gonderi/[no]">) {
  const user = await requireRole("musteri");
  const { no } = await params;
  const { yeni } = await searchParams;
  const s = getShipment(no);

  const isSender = s?.customerId === user.id;
  const isReceiver = s?.receiver.email?.toLowerCase() === user.email.toLowerCase();
  // Müşteri yalnızca kendisine ait gönderileri görebilir (gizlilik)
  if (!s || (!isSender && !isReceiver)) notFound();

  return (
    <>
      <Link href="/musteri" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} aria-hidden /> Kargolarım
      </Link>
      <PageHeader
        title={s.trackingNo}
        description={isSender ? "Gönderdiğiniz kargo" : "Size gelen kargo"}
        action={
          <Link href={`/takip/${s.trackingNo}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            Takip sayfası ve harita <ExternalLink size={14} aria-hidden />
          </Link>
        }
      />
      <div className="mb-6">
        <SpeakButton text={shipmentSpeech(s)} />
      </div>
      {yeni && (
        <div className="mb-6">
          <Alert tone="success">
            Gönderiniz oluşturuldu. Paketinizi seçtiğiniz şubeye götürün ve aşağıdaki QR kodu personele gösterin; etiket şubede yazdırılıp
            paketinize yapıştırılacaktır. Alıcıya bilgilendirme e-postası gönderildi.
          </Alert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <ShipmentInfo s={s} />
          <ShipmentHistory s={s} />
        </div>
        <div className="space-y-6">
          {isReceiver && <DeliveryPrefCard s={s} requireLast4={false} />}
          <GreenInfo s={s} />
          {s.greenAwarded && isReceiver && (
            <Alert tone="success">Yeşil tercihiniz için bu teslimattan {s.greenAwarded} yeşil puan kazandınız.</Alert>
          )}
          {isSender && s.status !== "TESLIM_EDILDI" && (
            <Card>
              <CardHeader
                title="Gönderi QR kodu"
                description={
                  s.status === "OLUSTURULDU"
                    ? "Şubede bu QR kodu personele gösterin; etiket şubede basılır. Yazıcınız varsa etiketi kendiniz de yazdırabilirsiniz."
                    : "Paketin üzerindeki etiket; QR kod her aşamada personel tarafından okutulur."
                }
              />
              <CardBody>
                <QrLabel data={labelData(s)} />
              </CardBody>
            </Card>
          )}
          {s.status === "TESLIM_EDILDI" && (
            <Card>
              <CardHeader title="Teslimatı değerlendirin" />
              <CardBody>
                {s.rating ? (
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-1">
                      Teslimat: {s.rating.delivery} <Star size={14} className="fill-accent-500 text-accent-500" aria-label="yıldız" />
                    </p>
                    <p className="flex items-center gap-1">
                      Kurye: {s.rating.courier} <Star size={14} className="fill-accent-500 text-accent-500" aria-label="yıldız" />
                    </p>
                    {s.rating.comment && <p className="text-slate-600">“{s.rating.comment}”</p>}
                  </div>
                ) : (
                  <RatingForm trackingNo={s.trackingNo} />
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
