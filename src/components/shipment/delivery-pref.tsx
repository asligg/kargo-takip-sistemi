import { CalendarDays, Leaf, Store, Users } from "lucide-react";
import { DeliveryPrefForm } from "@/components/forms/delivery-pref-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getBranch, shipmentCo2 } from "@/lib/data";
import { canEditPref, PREF_LABEL, PREF_SHORT } from "@/lib/delivery-pref";
import { estimateCo2, formatKg, GREEN_POINTS, nextGreenDate, nextWorkdays } from "@/lib/green";
import { formatDayLabel } from "@/lib/format";
import type { Shipment } from "@/lib/types";

/** Kurye ve şube ekranlarında alıcının teslimat tercihini gösteren rozet */
export function PrefBadge({ s, detail = false }: { s: Shipment; detail?: boolean }) {
  const p = s.deliveryPref;
  if (!p) return null;
  const green = p.option === "YESIL_GUN" || p.option === "SUBEDEN";
  const Icon = { BASKA_GUN: CalendarDays, SUBEDEN: Store, KOMSU: Users, YESIL_GUN: Leaf, ADRES: CalendarDays }[p.option];
  const extra = p.date ? formatDayLabel(p.date) : p.neighbor;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        green ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-sky-50 text-sky-800 ring-sky-200"
      }`}
    >
      <Icon size={12} aria-hidden />
      {PREF_SHORT[p.option]}
      {detail && extra && <span className="font-normal">· {extra}</span>}
    </span>
  );
}

/** Alıcının teslimat tercihini yönettiği kart (üye alıcı paneli ve herkese açık "Teslimatı yönet" sayfası) */
export function DeliveryPrefCard({ s, requireLast4 }: { s: Shipment; requireLast4: boolean }) {
  const dest = getBranch(s.destBranchId)!;
  const origin = getBranch(s.originBranchId)!;

  if (!canEditPref(s)) {
    return (
      <Card>
        <CardHeader title="Teslimat tercihi" />
        <CardBody className="text-sm text-slate-600">
          {s.deliveryPref ? (
            <p>
              Tercihiniz: <strong>{PREF_LABEL[s.deliveryPref.option]}</strong>
              {s.deliveryPref.neighbor && ` (${s.deliveryPref.neighbor})`}
            </p>
          ) : (
            <p>Kargo adrese teslim edildi / dağıtımda.</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Kargo dağıtıma çıktıktan sonra tercih değiştirilemez.</p>
        </CardBody>
      </Card>
    );
  }

  const greenOf = (o: "SUBEDEN" | "YESIL_GUN") => ({ saved: formatKg(estimateCo2(origin, dest, s.pkg.weightKg, s.pkg.desi, o).saved), points: GREEN_POINTS[o] });

  return (
    <Card>
      <CardHeader title="Kargom yolda, planım değişti" description="Kargonuz dağıtıma çıkmadan önce nasıl teslim edileceğini seçin." />
      <CardBody>
        <DeliveryPrefForm
          trackingNo={s.trackingNo}
          current={s.deliveryPref}
          requireLast4={requireLast4}
          workdays={nextWorkdays().map((d) => ({ value: d, label: formatDayLabel(d) }))}
          branchName={dest.name}
          greenDateLabel={formatDayLabel(nextGreenDate(dest))}
          green={{ SUBEDEN: greenOf("SUBEDEN"), YESIL_GUN: greenOf("YESIL_GUN") }}
        />
      </CardBody>
    </Card>
  );
}

/** Gönderinin tahmini karbon ayak izi */
export function GreenInfo({ s }: { s: Shipment }) {
  const c = shipmentCo2(s);
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-emerald-900">
        <Leaf size={16} aria-hidden /> Tahmini karbon ayak izi: {formatKg(c.total)} CO₂
      </p>
      <p className="mt-1 text-xs text-emerald-800">
        ~{c.km} km taşıma {formatKg(c.linehaul)} · son kilometre {formatKg(c.lastMile)}
        {c.saved > 0 && <> · alıcının yeşil tercihiyle <strong>{formatKg(c.saved)} tasarruf</strong></>}
      </p>
    </div>
  );
}
