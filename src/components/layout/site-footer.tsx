import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 text-sm text-brand-200">Gönderinizin her adımını takip edin, teslimatı siz yönetin, doğayı birlikte koruyalım.</p>
        </div>
        <nav aria-label="Alt menü">
          <p className="font-semibold text-white">Hızlı Erişim</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/">Kargo Takip</Link></li>
            <li><Link className="hover:text-white" href="/ucret-hesapla">Ücret Hesapla</Link></li>
            <li><Link className="hover:text-white" href="/subeler">Şubeler</Link></li>
            <li><Link className="hover:text-white" href="/iletisim">İletişim</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold text-white">İletişim</p>
          <p className="mt-3">Müşteri Hizmetleri: 0850 000 00 00</p>
          <p className="break-all">destek@yesilkargo.example</p>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-300">
        © 2026 Yeşil Kargo · Kargo Takip Sistemi · İnternet Programlama dersi projesi
      </div>
    </footer>
  );
}
