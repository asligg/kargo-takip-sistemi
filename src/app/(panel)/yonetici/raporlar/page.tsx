import type { Metadata } from "next";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { courierPerformance, listBranches, listShipments } from "@/lib/data";
import { formatTL } from "@/lib/price";

export const metadata: Metadata = { title: "Raporlar" };

/** Gönderi, şube ve kurye performans raporları (FR-21) */
export default async function AdminReports() {
  await requireRole("yonetici");
  const shipments = listShipments();
  const branches = listBranches().filter((b) => b.type === "sube");
  const perf = courierPerformance();

  const byBranch = branches.map((b) => {
    const out = shipments.filter((s) => s.originBranchId === b.id);
    const inc = shipments.filter((s) => s.destBranchId === b.id);
    const delivered = inc.filter((s) => s.status === "TESLIM_EDILDI").length;
    return { b, out: out.length, inc: inc.length, delivered, revenue: out.reduce((t, s) => t + s.price, 0) };
  });
  const total = shipments.length;
  const delivered = shipments.filter((s) => s.status === "TESLIM_EDILDI").length;
  const failed = shipments.filter((s) => s.status === "TESLIM_EDILEMEDI").length;

  return (
    <>
      <PageHeader title="Raporlar" description="Gönderi, şube ve kurye performansı" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Teslim oranı</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{total ? Math.round((delivered / total) * 100) : 0}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Teslim edilemeyen</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{failed}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Toplam ciro</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{formatTL(shipments.reduce((t, s) => t + s.price, 0))}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Şube raporu" />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Şube</th>
                <th className="px-5 py-3">Çıkan gönderi</th>
                <th className="px-5 py-3">Gelen gönderi</th>
                <th className="px-5 py-3">Teslim edilen</th>
                <th className="px-5 py-3">Ciro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byBranch.map((r) => (
                <tr key={r.b.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{r.b.name}</td>
                  <td className="px-5 py-3">{r.out}</td>
                  <td className="px-5 py-3">{r.inc}</td>
                  <td className="px-5 py-3">{r.delivered}</td>
                  <td className="px-5 py-3">{formatTL(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Kurye raporu" />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Kurye</th>
                <th className="px-5 py-3">Teslim edilen</th>
                <th className="px-5 py-3">Teslim edilemeyen</th>
                <th className="px-5 py-3">Başarı oranı</th>
                <th className="px-5 py-3">Ort. puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perf.map((p) => {
                const n = p.delivered + p.failed;
                return (
                  <tr key={p.courier.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{p.courier.name}</td>
                    <td className="px-5 py-3">{p.delivered}</td>
                    <td className="px-5 py-3">{p.failed}</td>
                    <td className="px-5 py-3">{n ? `${Math.round((p.delivered / n) * 100)}%` : "—"}</td>
                    <td className="px-5 py-3">{p.avgRating ? p.avgRating.toFixed(1) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}
