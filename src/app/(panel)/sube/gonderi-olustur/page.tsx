import type { Metadata } from "next";
import { ShipmentForm } from "@/components/forms/shipment-form";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getBranch, getTariff, listBranches } from "@/lib/data";

export const metadata: Metadata = { title: "Gönderi Kabul" };

/** Şubeye gelen müşterinin gönderisini personel oluşturur (FR-05) */
export default async function BranchCreatePage() {
  const user = await requireRole("sube");
  const branch = getBranch(user.branchId!)!;
  return (
    <>
      <PageHeader title="Gönderi Kabul" description={`${branch.name} — şubeye getirilen gönderiyi kaydedin.`} />
      <ShipmentForm by="sube" branches={listBranches()} tariff={getTariff()} fixedOriginId={branch.id} defaultSender={{ city: branch.city }} />
    </>
  );
}
