import { Building2, Leaf, Package, Sprout, Star, Truck } from "lucide-react";
import type { Metadata } from "next";
import { GreenChart, StatusPie, WeeklyChart } from "@/components/charts";
import { Card, CardBody, CardHeader, PageHeader, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { courierPerformance, greenStats, listBranches, listShipments, statusCounts } from "@/lib/data";
import { formatKg } from "@/lib/green";
import { GREEN_MONTHLY, WEEKLY_STATS } from "@/lib/mock-data";
import { STATUS_LABEL } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

/** Yönetici özet ekranı (FR-21) */
export default async function AdminDashboard() {
  await requireRole("yonetici");
  const shipments = listShipments();
  const counts = statusCounts();
  const perf = courierPerformance();
  const rated = shipments.filter((s) => s.rating);
  const avg = rated.length ? (rated.reduce((t, s) => t + s.rating!.delivery, 0) / rated.length).toFixed(1) : "—";
  const green = greenStats();
  // Son ayın değeri: geçmiş toplam (örnek veri) + sistemdeki gönderilerden hesaplanan gerçek tasarruf
  const monthly = GREEN_MONTHLY.map((m, i) => (i === GREEN_MONTHLY.length - 1 ? { ...m, tasarruf: Math.round(m.tasarruf + green.saved) } : m));
  const pie = (Object.keys(counts) as ShipmentStatus[]).map((k) => ({ name: STATUS_LABEL[k], value: counts[k] }));

  return (
    <>
      <PageHeader title="Dashboard" description="Sistem genelindeki gönderi ve performans özeti" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam gönderi" value={shipments.length} icon={<Package size={18} />} hint="Sistemdeki kayıtlı gönderiler" />
        <StatCard label="Dağıtımda" value={counts.DAGITIMDA ?? 0} icon={<Truck size={18} />} hint="Şu an kuryelerde" />
        <StatCard label="Şube / transfer merkezi" value={listBranches().length} icon={<Building2 size={18} />} />
        <StatCard label="Ortalama memnuniyet" value={avg} icon={<Star size={18} />} hint={`${rated.length} değerlendirme`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Son 7 gün" description="Oluşturulan ve teslim edilen gönderi sayıları" />
          <CardBody>
            <WeeklyChart data={WEEKLY_STATS} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Durumlara göre dağılım" />
          <CardBody>
            <StatusPie data={pie} />
          </CardBody>
        </Card>
      </div>
      <Card className="mt-6 border-emerald-200">
        <CardHeader title="Yeşil Kargo" description="Alıcıların şubeden teslim ve yeşil teslimat günü tercihleriyle önlenen son kilometre salımı (tahmini)" />
        <CardBody className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-800"><Leaf size={16} aria-hidden /> Bu ay tasarruf</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{formatKg(monthly.at(-1)!.tasarruf)} CO₂</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-800"><Sprout size={16} aria-hidden /> Yeşil tercih oranı</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">%{Math.round(green.ratio * 100)}</p>
              <p className="text-xs text-emerald-700">{green.greenCount} gönderide şubeden teslim / yeşil gün</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Dağıtılan yeşil puan</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{green.pointsAwarded}</p>
              <p className="text-xs text-emerald-700">Teslim edilen yeşil gönderilerden</p>
            </div>
          </div>
          <GreenChart data={monthly} />
        </CardBody>
      </Card>
      <Card className="mt-6">
        <CardHeader title="Kurye performansı" />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Kurye</th>
                <th className="px-5 py-3">Dağıtımda</th>
                <th className="px-5 py-3">Teslim edilen</th>
                <th className="px-5 py-3">Teslim edilemeyen</th>
                <th className="px-5 py-3">Ort. puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perf.map((p) => (
                <tr key={p.courier.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{p.courier.name}</td>
                  <td className="px-5 py-3">{p.active}</td>
                  <td className="px-5 py-3">{p.delivered}</td>
                  <td className="px-5 py-3">{p.failed}</td>
                  <td className="px-5 py-3">{p.avgRating ? p.avgRating.toFixed(1) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}
