import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Üye Ol" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-center text-2xl font-bold text-slate-900">Üye Ol</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Gönderi oluşturmak ve tüm kargolarınızı tek ekranda görmek için üye olun.</p>
      <Card className="mt-6">
        <CardBody className="py-6">
          <RegisterForm />
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-xs text-slate-500">Şube personeli ve kurye hesapları yönetici tarafından oluşturulur.</p>
    </div>
  );
}
