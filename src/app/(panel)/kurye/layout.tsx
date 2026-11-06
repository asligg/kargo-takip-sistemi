import { RoleLayout } from "@/components/layout/role-layout";

export default function CourierLayout({ children }: LayoutProps<"/kurye">) {
  return <RoleLayout role="kurye">{children}</RoleLayout>;
}
