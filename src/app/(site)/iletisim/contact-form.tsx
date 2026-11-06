"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(f.get("name")).trim()) next.name = "Ad soyad zorunludur.";
    if (!/^\S+@\S+\.\S+$/.test(String(f.get("email")))) next.email = "Geçerli bir e-posta adresi girin.";
    if (String(f.get("message")).trim().length < 10) next.message = "Mesajınız en az 10 karakter olmalıdır.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      {sent && (
        <div className="sm:col-span-2">
          <Alert tone="success">Mesajınız alındı. En kısa sürede size dönüş yapacağız.</Alert>
        </div>
      )}
      <Field label="Ad Soyad" htmlFor="name" error={errors.name} required>
        <Input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
      </Field>
      <Field label="E-posta" htmlFor="email" error={errors.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
      </Field>
      <Field label="Konu" htmlFor="topic" className="sm:col-span-2">
        <Select id="topic" name="topic">
          <option>Gönderi hakkında bilgi</option>
          <option>Şikâyet</option>
          <option>Öneri</option>
          <option>Kurumsal müşteri</option>
        </Select>
      </Field>
      <Field label="Takip numarası (varsa)" htmlFor="trackingNo" className="sm:col-span-2">
        <Input id="trackingNo" name="trackingNo" placeholder="KT2026110301" />
      </Field>
      <Field label="Mesajınız" htmlFor="message" error={errors.message} required className="sm:col-span-2">
        <Textarea id="message" name="message" rows={5} aria-invalid={!!errors.message} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit">Gönder</Button>
      </div>
    </form>
  );
}
