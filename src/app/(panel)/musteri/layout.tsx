import { RoleLayout } from "@/components/layout/role-layout";

export default function CustomerLayout({ children }: LayoutProps<"/musteri">) {
  return <RoleLayout role="musteri">{children}</RoleLayout>;
}
