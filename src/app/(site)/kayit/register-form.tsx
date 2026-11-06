"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} noValidate className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Ad Soyad" htmlFor="name" error={fe.name} required>
        <Input id="name" name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!fe.name} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-posta" htmlFor="email" error={fe.email} required>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!fe.email} />
        </Field>
        <Field label="Cep telefonu" htmlFor="phone" error={fe.phone} required hint="Size gelen kargoları eşleştirmek için kullanılır.">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="05XX XXX XX XX" defaultValue={v.phone} aria-invalid={!!fe.phone} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Parola" htmlFor="password" error={fe.password} required hint="En az 8 karakter">
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!fe.password} />
        </Field>
        <Field label="Parola (tekrar)" htmlFor="password2" error={fe.password2} required>
          <Input id="password2" name="password2" type="password" autoComplete="new-password" aria-invalid={!!fe.password2} />
        </Field>
      </div>
      <div>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="kvkk" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600" aria-invalid={!!fe.kvkk} />
          <span>Kişisel verilerin işlenmesine ilişkin aydınlatma metnini okudum ve kabul ediyorum.</span>
        </label>
        {fe.kvkk && <p className="mt-1 text-xs text-rose-600">{fe.kvkk}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Hesap oluşturuluyor…" : "Üye Ol"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Zaten üye misiniz?{" "}
        <Link href="/giris" className="font-medium text-brand-700 hover:underline">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
