import { ArrowLeft, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeliverForm } from "@/components/forms/delivery-forms";
import { StatusUpdateForm } from "@/components/forms/status-update-form";
import { PrefBadge } from "@/components/shipment/delivery-pref";
import { QrLabel } from "@/components/shipment/qr-label";
import { labelData, ShipmentHistory, ShipmentInfo } from "@/components/shipment/shipment-detail";
import { LinkButton } from "@/components/ui/button";
import { Alert, Card, CardBody, CardHeader, EmptyState, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { demoDeliveryCode, getShipment, isPickupReady, listBranches } from "@/lib/data";
import { BRANCH_NEXT } from "@/lib/status";

export const metadata: Metadata = { title: "Gönderi İşlemleri" };

export default async function BranchShipmentPage({ params, searchParams }: PageProps<"/sube/gonderi/[no]">) {
  const user = await requireRole("sube");
  const { no } = await params;
  const { yeni, teslim } = await searchParams;
  const s = getShipment(no);

  if (!s) {
    return (
      <EmptyState
        title="Gönderi bulunamadı"
        description={`${no} numaralı bir gönderi kayıtlı değil. QR kodu tekrar okutun veya numarayı kontrol edin.`}
        action={
          <LinkButton href="/sube/qr-okut">
            <ScanLine size={16} aria-hidden /> Tekrar okut
          </LinkButton>
        }
      />
    );
  }

  const transfers = listBranches()
    .filter((b) => b.type === "transfer")
    .map((b) => ({ id: b.id, name: b.name }));

  return (
    <>
      <Link href="/sube/qr-okut" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} aria-hidden /> Yeni QR okut
      </Link>
      <PageHeader title={s.trackingNo} description="Gönderi işlemleri" action={<PrefBadge s={s} detail />} />
      {teslim && (
        <div className="mb-6">
          <Alert tone="success">Gönderi alıcıya şubede teslim edildi.</Alert>
        </div>
      )}
      {yeni && (
        <div className="mb-6">
          <Alert tone="success">Gönderi kabul edildi ve takip numarası oluşturuldu. Etiketi yazdırıp pakete yapıştırın.</Alert>
        </div>
      )}
      {s.status === "OLUSTURULDU" && (
        <div className="mb-6">
          <Alert tone="warning">
            Müşteri bu gönderiyi çevrim içi oluşturdu. Paketin üzerinde etiket yoksa &quot;Kargo etiketi&quot; bölümündeki <strong>Etiketi Yazdır</strong> düğmesiyle
            basıp pakete yapıştırın, ardından durumu &quot;Şubeye Teslim Edildi&quot; olarak güncelleyin.
          </Alert>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <ShipmentInfo s={s} />
          <ShipmentHistory s={s} />
        </div>
        <div className="space-y-6">
          {isPickupReady(s) && s.destBranchId === user.branchId && (
            <Card className="border-emerald-300">
              <CardHeader title="Şubeden teslim et" description="Alıcı kargoyu şubeden almayı seçti. E-postasına gelen 6 haneli kodu isteyin." />
              <CardBody>
                <DeliverForm trackingNo={s.trackingNo} demoCode={demoDeliveryCode(s.trackingNo)} at="sube" />
              </CardBody>
            </Card>
          )}
          <Card>
            <CardHeader title="Durum güncelle" description="Güncelleme sonrası alıcıya otomatik e-posta gönderilir." />
            <CardBody>
              <StatusUpdateForm trackingNo={s.trackingNo} options={BRANCH_NEXT[s.status] ?? []} transfers={transfers} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Kargo etiketi" />
            <CardBody>
              <QrLabel data={labelData(s)} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
