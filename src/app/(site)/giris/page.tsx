import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function LoginPage({ searchParams }: PageProps<"/giris">) {
  const { yonlendir } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-2xl font-bold text-slate-900">Giriş Yap</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Müşteri, şube personeli, kurye ve yönetici girişi</p>
      <Card className="mt-6">
        <CardBody className="py-6">
          <LoginForm next={typeof yonlendir === "string" ? yonlendir : undefined} />
        </CardBody>
      </Card>
    </div>
  );
}
