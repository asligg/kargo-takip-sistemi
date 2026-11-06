import { MapPin, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { removeAddressAction } from "@/app/actions/customer";
import { AddressForm } from "@/components/forms/customer-forms";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listAddresses, listBranches } from "@/lib/data";

export const metadata: Metadata = { title: "Adres Defterim" };

/** Adres defteri yönetimi (FR-04) */
export default async function AddressesPage() {
  const user = await requireRole("musteri");
  const addresses = listAddresses(user.id);
  const cities = [...new Set(listBranches().map((b) => b.city))].sort((a, b) => a.localeCompare(b, "tr"));

  return (
    <>
      <PageHeader title="Adres Defterim" description="Sık kullandığınız adresleri kaydedin; gönderi oluştururken tek tıkla seçin." />
      <div className="space-y-6">
        <AddressForm cities={cities} />
        {addresses.length === 0 ? (
          <EmptyState icon={<MapPin size={36} />} title="Kayıtlı adresiniz yok" description="Yeni adres ekleyerek başlayın." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{a.title}</span>
                    <form action={removeAddressAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`${a.title} adresini sil`}>
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                  <p className="mt-3 font-medium text-slate-900">{a.party.name}</p>
                  <p className="text-sm text-slate-600">{a.party.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {a.party.address}, {a.party.district}/{a.party.city}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
