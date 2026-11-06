import { Building2, MapPin, Phone, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui/card";
import { listBranches } from "@/lib/data";

export const metadata: Metadata = { title: "Şubeler" };

export default function BranchesPage() {
  const branches = listBranches();
  const cities = [...new Set(branches.map((b) => b.city))].sort((a, b) => a.localeCompare(b, "tr"));
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="Şubeler ve Transfer Merkezleri" description="Size en yakın şubeyi bulun." />
      <div className="space-y-8">
        {cities.map((city) => (
          <section key={city} aria-labelledby={`city-${city}`}>
            <h2 id={`city-${city}`} className="mb-3 text-lg font-semibold text-slate-900">
              {city}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {branches
                .filter((b) => b.city === city)
                .map((b) => (
                  <Card key={b.id} className="p-5">
                    <div className="flex items-center gap-2">
                      {b.type === "transfer" ? <Warehouse size={18} className="text-indigo-600" aria-hidden /> : <Building2 size={18} className="text-brand-600" aria-hidden />}
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{b.type === "transfer" ? "Transfer merkezi" : "Şube"}</p>
                    <p className="mt-3 flex gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden /> {b.address}
                    </p>
                    <p className="mt-1 flex gap-2 text-sm text-slate-600">
                      <Phone size={16} className="mt-0.5 shrink-0" aria-hidden /> {b.phone}
                    </p>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
