import { CalendarCog, Leaf, MapPinned, PackagePlus, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { TrackForm } from "@/components/shipment/track-form";
import { LinkButton } from "@/components/ui/button";

const STEPS = [
  { icon: PackagePlus, title: "Gönderini oluştur", text: "Bilgileri çevrim içi gir, ücretini hemen gör, gönderine özel QR kodunu al." },
  { icon: ScanLine, title: "Şubeye teslim et", text: "QR kodunu telefonundan göster; personel etiketini basıp pakete yapıştırır. Her aşamada e-posta alırsın." },
  { icon: ShieldCheck, title: "Kodla teslim al", text: "Kurye kapına geldiğinde sana gönderilen 6 haneli kodu söyle, teslimat tamamlansın." },
];

const FEATURES = [
  { icon: CalendarCog, title: "Teslimatı sen yönet", text: "Evde olmayacak mısın? Kargo dağıtıma çıkmadan başka gün seç, şubeden al ya da komşuna bıraktır." },
  { icon: Leaf, title: "Yeşil teslimat", text: "Kargonun karbon ayak izini gör; şubeden al veya yeşil günü seç, puan kazan, indirim al." },
  { icon: MapPinned, title: "Haritada rota", text: "Gönderinin geçtiği şubeleri harita üzerinde izle." },
];

const DEMO_NUMBERS = ["KT2026110301", "KT2026110310", "KT2026110288", "KT2026110277"];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">Üye olmadan sorgula</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Kargon nerede? <span className="text-accent-400">Hemen öğren.</span>
            </h1>
            <p className="mt-4 text-lg text-brand-100">Takip numaranı gir; gönderinin durumunu, geçtiği şubeleri ve tahmini teslim tarihini gör.</p>
          </div>
          <div className="mt-8 max-w-2xl">
            <TrackForm />
            <p className="mt-3 text-sm text-brand-200">
              Denemek için:{" "}
              {DEMO_NUMBERS.map((n, i) => (
                <span key={n}>
                  <Link href={`/takip/${n}`} className="font-mono text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                    {n}
                  </Link>
                  {i < DEMO_NUMBERS.length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="nasil">
        <h2 id="nasil" className="text-center text-2xl font-bold text-slate-900">
          Nasıl çalışır?
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-slate-400">Adım {i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <Icon className="mt-1 shrink-0 text-accent-600" size={24} aria-hidden />
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-accent-500 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tüm kargoların tek ekranda</h2>
            <p className="mt-1 text-slate-800">Üye ol; gönderdiğin ve sana gelen kargoları &quot;Kargolarım&quot; ekranından takip et.</p>
          </div>
          <div className="flex gap-3">
            <LinkButton href="/kayit" variant="primary" size="lg">
              Ücretsiz Üye Ol
            </LinkButton>
            <LinkButton href="/ucret-hesapla" variant="outline" size="lg">
              Ücret Hesapla
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
