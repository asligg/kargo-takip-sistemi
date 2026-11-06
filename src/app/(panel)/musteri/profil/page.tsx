import type { Metadata } from "next";
import { ProfileForm } from "@/components/forms/customer-forms";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Profilim" };

/** Profil yönetimi (FR-04) */
export default async function ProfilePage() {
  const user = await requireRole("musteri");
  return (
    <>
      <PageHeader title="Profilim" description="Hesap bilgilerinizi güncelleyin." />
      <Card className="max-w-2xl">
        <CardHeader title="Kişisel bilgiler" />
        <CardBody>
          <ProfileForm name={user.name} email={user.email} phone={user.phone} />
        </CardBody>
      </Card>
    </>
  );
}
