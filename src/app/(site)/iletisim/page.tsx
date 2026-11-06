import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Card, CardBody, PageHeader } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="İletişim" description="Soru, öneri ve şikâyetleriniz için bize ulaşın." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody>
            <ContactForm />
          </CardBody>
        </Card>
        <div className="space-y-4">
          {[
            { icon: Phone, title: "Müşteri Hizmetleri", text: "0850 000 00 00 (Hafta içi 08:00–20:00)" },
            { icon: Mail, title: "E-posta", text: "destek@yesilkargo.example" },
            { icon: MapPin, title: "Genel Müdürlük", text: "Atatürk Cad. No:12, Merkez/Sivas" },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="flex gap-3 p-4">
              <Icon className="mt-0.5 shrink-0 text-brand-600" size={20} aria-hidden />
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-600">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
