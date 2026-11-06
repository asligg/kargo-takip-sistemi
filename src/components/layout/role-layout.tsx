import { logoutAction } from "@/app/actions/auth";
import { requireRole } from "@/lib/auth";
import { getBranch } from "@/lib/data";
import { ROLE_LABEL, ROLE_NAV } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { PanelShell } from "./panel-shell";

/** Rol kontrolü yapan ortak panel düzeni; yetkisiz kullanıcı giriş veya yetkisiz sayfasına yönlendirilir. */
export async function RoleLayout({ role, children }: { role: Role; children: React.ReactNode }) {
  const user = await requireRole(role);
  const branch = user.branchId ? getBranch(user.branchId)?.name : undefined;
  return (
    <PanelShell nav={ROLE_NAV[role]} userName={user.name} roleLabel={ROLE_LABEL[role]} subtitle={branch} logoutAction={logoutAction}>
      {children}
    </PanelShell>
  );
}
