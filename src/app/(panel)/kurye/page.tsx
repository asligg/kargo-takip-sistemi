import { ChevronRight, MapPin, Phone, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourierRouteCard } from "@/components/shipment/courier-route";
import { PrefBadge } from "@/components/shipment/delivery-pref";
import { StatusBadge } from "@/components/shipment/status-badge";
import { LinkButton } from "@/components/ui/button";
import { Alert, EmptyState, PageHeader, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { optimizeCourierRoute } from "@/lib/courier-route";
import { getBranch, listCourierShipments } from "@/lib/data";
import type { Shipment } from "@/lib/types";

export const metadata: Metadata = { title: "Atanan Gönderiler" };

function DeliveryCard({ s, stop }: { s: Shipment; stop?: number }) {
  const active = s.status === "DAGITIMDA";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2 font-mono font-semibold text-slate-900">
          {stop && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 font-sans text-xs font-bold text-white" aria-label={`${stop}. durak`}>
              {stop}
            </span>
          )}
          {s.trackingNo}
        </span>
        <StatusBadge status={s.status} />
      </div>
      <p className="mt-2 font-medium text-slate-900">{s.receiver.name}</p>
      {s.deliveryPref && (
        <p className="mt-1">
          <PrefBadge s={s} detail />
        </p>
      )}
      <p className="mt-1 flex gap-1.5 text-sm text-slate-600">
        <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden />
        {s.receiver.address}, {s.receiver.district}
      </p>
      <p className="mt-1 flex gap-1.5 text-sm text-slate-600">
        <Phone size={15} className="mt-0.5 shrink-0" aria-hidden />
        {s.receiver.phone}
      </p>
      {active && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          Teslimata başla <ChevronRight size={16} aria-hidden />
        </span>
      )}
    </>
  );
  return active ? (
    <Link href={`/kurye/teslimat/${s.trackingNo}`} className="block rounded-xl border-2 border-brand-200 bg-white p-4 shadow-sm hover:border-brand-400">
      {inner}
    </Link>
  ) : (
    <div className="rounded-xl border border-slate-200 bg-white p-4 opacity-80">{inner}</div>
  );
}

/** Kuryeye atanan gönderiler */
export default async function CourierHome({ searchParams }: PageProps<"/kurye">) {
  const user = await requireRole("kurye");
  const { teslim, basarisiz } = await searchParams;
  const all = listCourierShipments(user.id);
  const branch = getBranch(user.branchId!)!;
  // Dağıtımdaki gönderiler en kısa rota sırasına göre dizilir
  const route = optimizeCourierRoute(branch, all.filter((s) => s.status === "DAGITIMDA"));
  const active = route.stops.map((st) => st.shipment);
  const done = all.filter((s) => s.status !== "DAGITIMDA");

  return (
    <>
      <PageHeader
        title="Atanan Gönderiler"
        description="Bugünkü dağıtım listeniz"
        action={
          <LinkButton href="/kurye/qr-okut" size="lg">
            <ScanLine size={18} aria-hidden /> QR Okut
          </LinkButton>
        }
      />
      {typeof teslim === "string" && (
        <div className="mb-4">
          <Alert tone="success">{teslim} numaralı gönderi teslim edildi. Alıcıya teslimat bilgisi gönderildi.</Alert>
        </div>
      )}
      {typeof basarisiz === "string" && (
        <div className="mb-4">
          <Alert tone="warning">{basarisiz} numaralı gönderi &quot;Teslim Edilemedi&quot; olarak kaydedildi ve şubeye bildirildi.</Alert>
        </div>
      )}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Dağıtımda" value={active.length} />
        <StatCard label="Teslim edilen" value={done.filter((s) => s.status === "TESLIM_EDILDI").length} />
        <StatCard label="Teslim edilemeyen" value={done.filter((s) => s.status === "TESLIM_EDILEMEDI").length} />
      </div>

      {active.length > 0 && <CourierRouteCard route={route} branch={branch} />}

      <section aria-labelledby="h-active" className="mb-8">
        <h2 id="h-active" className="mb-3 font-semibold text-slate-900">Teslim edilecekler (rota sırasıyla)</h2>
        {active.length === 0 ? (
          <EmptyState title="Dağıtımda gönderiniz yok" description="Şube tarafından size gönderi atandığında burada listelenir." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {active.map((s, i) => (
              <li key={s.trackingNo}>
                <DeliveryCard s={s} stop={i + 1} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section aria-labelledby="h-done">
          <h2 id="h-done" className="mb-3 font-semibold text-slate-900">Tamamlananlar</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {done.map((s) => (
              <li key={s.trackingNo}>
                <DeliveryCard s={s} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
