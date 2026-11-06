import { MapPinOff } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <MapPinOff size={56} className="text-brand-400" aria-hidden />
      <p className="mt-4 font-mono text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Aradığınız sayfa bulunamadı</h1>
      <p className="mt-2 max-w-sm text-slate-600">Sayfa taşınmış ya da hiç var olmamış olabilir. Kargonuzu takip etmek için ana sayfaya dönün.</p>
      <LinkButton href="/" className="mt-6">
        Ana Sayfaya Dön
      </LinkButton>
    </div>
  );
}
