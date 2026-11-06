import { RoleLayout } from "@/components/layout/role-layout";

export default function AdminLayout({ children }: LayoutProps<"/yonetici">) {
  return <RoleLayout role="yonetici">{children}</RoleLayout>;
}
