import { Leaf, Navigation, Route } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { googleMapsLinks, type CourierRoute } from "@/lib/courier-route";
import { formatKg } from "@/lib/green";
import type { Branch } from "@/lib/types";
import { StopsMapLazy } from "./stops-map-lazy";

const km = (v: number) => `${v.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`;

/** Kurye paneli: optimize edilmiş günlük rota, harita ve Google Haritalar navigasyonu */
export function CourierRouteCard({ route, branch }: { route: CourierRoute; branch: Branch }) {
  const links = googleMapsLinks(route.start, route.stops);
  const approx = route.stops.filter((s) => s.approximate).length;

  return (
    <Card className="mb-8 overflow-hidden border-brand-200">
      <CardHeader
        title="Bugünkü rotam"
        description={`${route.stops.length} durak · ${branch.name} çıkışlı, en kısa sıraya göre dizildi`}
        action={<Route size={20} className="text-brand-600" aria-hidden />}
      />
      <CardBody className="space-y-4">
        {route.stops.length === 1 ? (
          <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
            Tek durak: <strong>{km(route.km)}</strong>. Sıralama gerekmiyor; navigasyonla doğrudan adrese gidebilirsiniz.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-600">Optimizasyon olmadan</p>
              <p className="text-xl font-bold text-slate-700">{km(route.baselineKm)}</p>
              <p className="text-[11px] text-slate-500">Duraklar listedeki sırayla gezilseydi</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs font-medium text-brand-800">Optimize rota</p>
              <p className="text-xl font-bold text-brand-900">{km(route.km)}</p>
              <p className="text-[11px] text-brand-700">En kısa durak sırası</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="flex items-center gap-1 text-xs font-medium text-emerald-800">
                <Leaf size={12} aria-hidden /> Tasarruf
              </p>
              <p className="text-xl font-bold text-emerald-900">
                {km(route.savedKm)} · {formatKg(route.savedCo2)} CO₂
              </p>
            </div>
          </div>
        )}

        <StopsMapLazy
          start={{ ...route.start, label: branch.name }}
          stops={route.stops.map((s) => ({
            lat: s.lat,
            lng: s.lng,
            label: s.shipment.receiver.name,
            detail: `${s.shipment.receiver.address} · ${s.shipment.trackingNo}`,
          }))}
        />

        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Navigation size={16} aria-hidden />
              {links.length === 1 ? "Google Haritalar'da navigasyonu başlat" : `Navigasyon: ${l.from}–${l.to}. duraklar`}
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Sıra kuş uçuşu mesafeye göre hesaplanır (tahmini); yol tarifini Google Haritalar gerçek yol ağına göre verir.
          {approx > 0 && ` ${approx} adresin tam konumu bilinmediği için ilçe merkezi kullanıldı.`}
        </p>
      </CardBody>
    </Card>
  );
}
