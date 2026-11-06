import type { Metadata } from "next";
import { ScanAndGo } from "@/components/shipment/scan-and-go";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "QR Okut" };

/** QR okut ve durum güncelle (FR-12) */
export default function BranchScanPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="QR Okut / Durum Güncelle" description="Paketin üzerindeki QR kodu okutun; gönderi açılınca yeni durumunu seçin." />
      <ScanAndGo basePath="/sube/gonderi" />
    </div>
  );
}
