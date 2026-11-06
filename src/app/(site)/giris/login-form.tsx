"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef } from "react";
import { loginAction, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { BRANCHES, USERS } from "@/lib/mock-data";
import { ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";

const ROLE_ORDER: Role[] = ["musteri", "sube", "kurye", "yonetici"];
const branchName = (id?: string) => BRANCHES.find((b) => b.id === id)?.name.replace(/ Şube$/, "");

const DEMO = [
  { role: "Müşteri", email: "musteri@demo.com" },
  { role: "Şube Personeli", email: "sube@demo.com" },
  { role: "Kurye", email: "kurye@demo.com" },
  { role: "Yönetici", email: "yonetici@demo.com" },
];

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  function fillDemo(email: string) {
    if (emailRef.current) emailRef.current.value = email;
    if (passRef.current) passRef.current.value = "demo1234";
  }

  return (
    <div className="space-y-6">
      <form action={action} noValidate className="space-y-4">
        {state.error && <Alert tone="error">{state.error}</Alert>}
        <input type="hidden" name="yonlendir" value={next ?? ""} />
        <Field label="E-posta" htmlFor="email" error={state.fieldErrors?.email} required>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={!!state.fieldErrors?.email}
          />
        </Field>
        <Field label="Parola" htmlFor="password" error={state.fieldErrors?.password} required>
          <Input ref={passRef} id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!state.fieldErrors?.password} />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>
          <LogIn size={18} aria-hidden /> {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="font-medium text-brand-700 hover:underline">
            Üye olun
          </Link>
        </p>
      </form>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">Demo hesaplar (parola: demo1234)</p>
        <p className="mt-0.5 text-xs text-amber-800">Bir rol seçerek bilgileri forma doldurabilirsiniz.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fillDemo(d.email)}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-left text-sm hover:bg-amber-100"
            >
              <span className="block font-medium text-slate-900">{d.role}</span>
              <span className="block truncate text-xs text-slate-500">{d.email}</span>
            </button>
          ))}
        </div>
        <label htmlFor="demo-all" className="mt-4 block text-xs font-medium text-amber-900">
          Diğer demo hesaplar (farklı şube ve kuryeler)
        </label>
        <Select
          id="demo-all"
          className="mt-1"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) fillDemo(e.target.value);
          }}
        >
          <option value="">Hesap seçin…</option>
          {ROLE_ORDER.map((role) => (
            <optgroup key={role} label={ROLE_LABEL[role]}>
              {USERS.filter((u) => u.role === role).map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name}
                  {u.branchId ? ` — ${branchName(u.branchId)}` : ""} ({u.email})
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>
    </div>
  );
}
