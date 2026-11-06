import { ShieldX } from "lucide-react";
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Yetkisiz Erişim" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <ShieldX size={56} className="text-rose-500" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Bu sayfaya erişim yetkiniz yok</h1>
      <p className="mt-2 text-slate-600">Hesabınızın rolü bu sayfayı görüntülemeye izin vermiyor. Farklı bir hesapla giriş yapabilir veya kendi panelinize dönebilirsiniz.</p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/" variant="outline">
          Ana Sayfa
        </LinkButton>
        <LinkButton href="/giris">Farklı hesapla giriş yap</LinkButton>
      </div>
    </div>
  );
}
