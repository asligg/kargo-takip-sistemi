import type { Metadata } from "next";
import { ScanAndGo } from "@/components/shipment/scan-and-go";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "QR Okut" };

export default function CourierScanPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="QR Okut" description="Teslim edeceğiniz paketin QR kodunu okutun." />
      <ScanAndGo basePath="/kurye/teslimat" />
    </div>
  );
}
