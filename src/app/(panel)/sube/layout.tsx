import { RoleLayout } from "@/components/layout/role-layout";

export default function BranchLayout({ children }: LayoutProps<"/sube">) {
  return <RoleLayout role="sube">{children}</RoleLayout>;
}
