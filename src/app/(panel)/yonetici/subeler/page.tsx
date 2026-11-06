import type { Metadata } from "next";
import { BranchForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listBranches, listShipments, listUsers } from "@/lib/data";

export const metadata: Metadata = { title: "Şubeler" };

/** Şube ve transfer merkezi yönetimi (FR-19) */
export default async function AdminBranches() {
  await requireRole("yonetici");
  const branches = listBranches();
  const staff = listUsers().filter((u) => u.branchId);
  const shipments = listShipments();

  return (
    <>
      <PageHeader title="Şubeler" description="Şube ve transfer merkezlerini yönetin." />
      <div className="mb-6">
        <BranchForm />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Tür</th>
              <th className="px-4 py-3">Şehir</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Personel</th>
              <th className="px-4 py-3">Varış gönderisi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {branches.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{b.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.type === "transfer" ? "bg-indigo-50 text-indigo-700" : "bg-brand-50 text-brand-700"}`}>
                    {b.type === "transfer" ? "Transfer merkezi" : "Şube"}
                  </span>
                </td>
                <td className="px-4 py-3">{b.city}</td>
                <td className="px-4 py-3">{b.phone}</td>
                <td className="px-4 py-3">{staff.filter((u) => u.branchId === b.id).length}</td>
                <td className="px-4 py-3">{shipments.filter((s) => s.destBranchId === b.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
