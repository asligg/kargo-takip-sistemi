import type { Metadata } from "next";
import { ShipmentForm } from "@/components/forms/shipment-form";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTariff, listAddresses, listBranches } from "@/lib/data";

export const metadata: Metadata = { title: "Gönderi Oluştur" };

/** Çevrim içi gönderi oluşturma (UC-01) */
export default async function CreateShipmentPage() {
  const user = await requireRole("musteri");
  const addresses = listAddresses(user.id);
  const home = addresses[0]?.party;
  return (
    <>
      <PageHeader title="Gönderi Oluştur" description="Bilgileri girin, ücreti görün; QR kodlu etiketiniz hemen oluşturulsun." />
      <ShipmentForm
        by="musteri"
        branches={listBranches()}
        tariff={getTariff()}
        addresses={addresses}
        greenPoints={user.greenPoints ?? 0}
        defaultSender={{ name: user.name, phone: user.phone, email: user.email, city: home?.city, district: home?.district, address: home?.address }}
      />
    </>
  );
}
