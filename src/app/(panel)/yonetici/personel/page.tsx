import type { Metadata } from "next";
import { toggleUserAction } from "@/app/actions/admin";
import { StaffForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getBranch, listBranches, listUsers } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/nav";

export const metadata: Metadata = { title: "Personel ve Kuryeler" };

/** Personel ve kurye hesaplarının yönetimi (FR-19) */
export default async function AdminStaff() {
  await requireRole("yonetici");
  const users = listUsers().filter((u) => u.role !== "yonetici");
  const branches = listBranches()
    .filter((b) => b.type === "sube")
    .map((b) => ({ id: b.id, name: b.name }));

  return (
    <>
      <PageHeader title="Personel ve Kuryeler" description="Şube personeli ve kurye hesapları yalnızca yönetici tarafından oluşturulur." />
      <div className="mb-6">
        <StaffForm branches={branches} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Şube</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">
                <span className="sr-only">İşlem</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3">{ROLE_LABEL[u.role]}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{u.branchId ? getBranch(u.branchId)?.name : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.active ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className="text-sm font-medium text-brand-700 hover:underline">
                      {u.active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
