"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { addAddressAction, updateProfileAction } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {v.ok && <div className="sm:col-span-2"><Alert tone="success">Profil bilgileriniz güncellendi.</Alert></div>}
      <Field label="Ad Soyad" htmlFor="name" error={fe.name} required>
        <Input id="name" name="name" defaultValue={v.name ?? name} aria-invalid={!!fe.name} />
      </Field>
      <Field label="Cep telefonu" htmlFor="phone" error={fe.phone} required>
        <Input id="phone" name="phone" type="tel" defaultValue={v.phone ?? phone} aria-invalid={!!fe.phone} />
      </Field>
      <Field label="E-posta" htmlFor="email" hint="E-posta adresi değiştirilemez." className="sm:col-span-2">
        <Input id="email" value={email} disabled readOnly />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
      </div>
    </form>
  );
}

export function AddressForm({ cities }: { cities: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addAddressAction, {});
  const [open, setOpen] = useState(false);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (!open)
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden /> Yeni Adres Ekle
      </Button>
    );

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      {v.ok && <div className="sm:col-span-2"><Alert tone="success">Adres eklendi. Yeni bir adres daha ekleyebilirsiniz.</Alert></div>}
      <Field label="Adres başlığı" htmlFor="title" error={fe.title} required>
        <Input id="title" name="title" placeholder="Ev, İş, Annem…" defaultValue={v.title} aria-invalid={!!fe.title} />
      </Field>
      <Field label="Ad Soyad" htmlFor="a-name" error={fe.name} required>
        <Input id="a-name" name="name" defaultValue={v.name} aria-invalid={!!fe.name} />
      </Field>
      <Field label="Telefon" htmlFor="a-phone" error={fe.phone} required>
        <Input id="a-phone" name="phone" type="tel" placeholder="05XX XXX XX XX" defaultValue={v.phone} aria-invalid={!!fe.phone} />
      </Field>
      <Field label="E-posta" htmlFor="a-email" error={fe.email}>
        <Input id="a-email" name="email" type="email" defaultValue={v.email} aria-invalid={!!fe.email} />
      </Field>
      <Field label="Şehir" htmlFor="a-city" error={fe.city} required>
        <Select id="a-city" name="city" defaultValue={v.city ?? ""} aria-invalid={!!fe.city}>
          <option value="">Seçin</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <Field label="İlçe" htmlFor="a-district" error={fe.district} required>
        <Input id="a-district" name="district" defaultValue={v.district} aria-invalid={!!fe.district} />
      </Field>
      <Field label="Açık adres" htmlFor="a-address" error={fe.address} required className="sm:col-span-2">
        <Textarea id="a-address" name="address" rows={2} defaultValue={v.address} aria-invalid={!!fe.address} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Vazgeç</Button>
      </div>
    </form>
  );
}
