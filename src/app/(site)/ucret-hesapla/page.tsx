import type { Metadata } from "next";
import { PriceCalculator } from "@/components/shipment/price-calculator";
import { Card, CardBody, PageHeader } from "@/components/ui/card";
import { getTariff, listBranches } from "@/lib/data";

export const metadata: Metadata = { title: "Ücret Hesapla" };

export default function PricePage() {
  const cities = [...new Set(listBranches().map((b) => b.city))].sort((a, b) => a.localeCompare(b, "tr"));
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="Ücret Hesapla" description="Paketinizin ağırlık ve ölçülerine göre tahmini gönderi ücretini öğrenin." />
      <Card>
        <CardBody className="py-6">
          <PriceCalculator tariff={getTariff()} cities={cities} />
        </CardBody>
      </Card>
    </div>
  );
}
