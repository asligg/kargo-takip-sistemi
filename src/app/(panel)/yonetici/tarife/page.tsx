import type { Metadata } from "next";
import { TariffForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getTariff } from "@/lib/data";
import { INTERCITY_RATE } from "@/lib/price";

export const metadata: Metadata = { title: "Ücret Tarifesi" };

/** Ücret tarifesi yönetimi (FR-20) */
export default async function AdminTariff() {
  await requireRole("yonetici");
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Ücret Tarifesi"
        description={`Desi aralıklarına göre gönderi ücretleri. Şehir dışı gönderilere %${INTERCITY_RATE * 100} ek ücret uygulanır.`}
      />
      <TariffForm tariff={getTariff()} />
    </div>
  );
}
