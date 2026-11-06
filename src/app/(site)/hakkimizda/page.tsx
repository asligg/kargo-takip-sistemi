import { CalendarCog, Leaf, MapPinned, ShieldCheck, ScanLine, Zap } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Hakkımızda" };

const ITEMS = [
  { icon: Zap, title: "Anlık takip", text: "Gönderinizin durumu, şube veya kurye işlem yaptığı anda takip sayfanıza yansır." },
  { icon: MapPinned, title: "Harita üzerinde rota", text: "Gönderinizin geçtiği şubeleri ve transfer merkezlerini harita üzerinde görürsünüz." },
  { icon: ScanLine, title: "QR kodlu işlem", text: "Personelimiz her aşamada paketin QR kodunu okutur; elle giriş hataları ortadan kalkar." },
  { icon: ShieldCheck, title: "Doğrulama kodlu teslimat", text: "Gönderiniz yalnızca size iletilen 6 haneli kod ile teslim edilir." },
  { icon: CalendarCog, title: "Teslimatı siz yönetin", text: "Evde olmayacaksanız kargonuz dağıtıma çıkmadan başka bir gün seçin, şubeden alın veya komşunuza bıraktırın." },
  { icon: Leaf, title: "Yeşil Kargo", text: "Her gönderinin karbon ayak izini gösteririz. Şubeden teslim veya yeşil teslimat günü seçenlere yeşil puan veririz." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="Hakkımızda" description="Yeşil Kargo, gönderi kabulünden teslimata kadar tüm süreci tek bir platformda yöneten, çevreye duyarlı bir kargo takip sistemidir." />
      <div className="space-y-4 leading-relaxed text-slate-700">
        <p>
          Sistemimiz; müşterilerin gönderi oluşturup takip edebildiği, şube personeli ve kuryelerin gönderi hareketlerini QR kod
          ile hızlı ve hatasız kaydedebildiği, yöneticilerin ise tüm süreci raporlayabildiği web tabanlı bir kargo takip
          uygulamasıdır.
        </p>
        <p>Takip numaranızla üye olmadan sorgulama yapabilir, üye olarak gönderdiğiniz ve size gelen tüm kargoları tek ekranda görebilirsiniz.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
            <Icon className="text-brand-600" size={24} aria-hidden />
            <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
