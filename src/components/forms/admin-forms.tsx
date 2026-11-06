"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { addBranchAction, addStaffAction, updateTariffAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import type { TariffRow } from "@/lib/types";

function Toggle({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden /> {label}
      </Button>
    );
  return <>{children(() => setOpen(false))}</>;
}

export function BranchForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addBranchAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <Toggle label="Yeni Şube Ekle">
      {(close) => (
        <form action={action} className="grid w-full gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          {v.ok && <div className="sm:col-span-2"><Alert tone="success">Şube eklendi.</Alert></div>}
          <Field label="Şube adı" htmlFor="b-name" error={fe.name} required>
            <Input id="b-name" name="name" defaultValue={v.name} aria-invalid={!!fe.name} />
          </Field>
          <Field label="Tür" htmlFor="b-type">
            <Select id="b-type" name="type" defaultValue={v.type ?? "sube"}>
              <option value="sube">Şube</option>
              <option value="transfer">Transfer merkezi</option>
            </Select>
          </Field>
          <Field label="Şehir" htmlFor="b-city" error={fe.city} required>
            <Input id="b-city" name="city" defaultValue={v.city} aria-invalid={!!fe.city} />
          </Field>
          <Field label="Telefon" htmlFor="b-phone" error={fe.phone} required>
            <Input id="b-phone" name="phone" defaultValue={v.phone} aria-invalid={!!fe.phone} />
          </Field>
          <Field label="Adres" htmlFor="b-address" error={fe.address} required className="sm:col-span-2">
            <Input id="b-address" name="address" defaultValue={v.address} aria-invalid={!!fe.address} />
          </Field>
          <Field label="Enlem" htmlFor="b-lat" error={fe.lat} required hint="Harita konumu (ör. 39.75)">
            <Input id="b-lat" name="lat" type="number" step="0.0001" defaultValue={v.lat} aria-invalid={!!fe.lat} />
          </Field>
          <Field label="Boylam" htmlFor="b-lng" error={fe.lng} required hint="Harita konumu (ör. 37.01)">
            <Input id="b-lng" name="lng" type="number" step="0.0001" defaultValue={v.lng} aria-invalid={!!fe.lng} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
            <Button type="button" variant="ghost" onClick={close}>Kapat</Button>
          </div>
        </form>
      )}
    </Toggle>
  );
}

export function StaffForm({ branches }: { branches: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addStaffAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <Toggle label="Personel / Kurye Ekle">
      {(close) => (
        <form action={action} className="grid w-full gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          {v.ok && <div className="sm:col-span-2"><Alert tone="success">Hesap oluşturuldu. Giriş bilgileri kullanıcıya e-postayla iletilecektir.</Alert></div>}
          <Field label="Ad Soyad" htmlFor="s-name" error={fe.name} required>
            <Input id="s-name" name="name" defaultValue={v.name} aria-invalid={!!fe.name} />
          </Field>
          <Field label="Rol" htmlFor="s-role">
            <Select id="s-role" name="role" defaultValue={v.role ?? "sube"}>
              <option value="sube">Şube Personeli</option>
              <option value="kurye">Kurye</option>
            </Select>
          </Field>
          <Field label="E-posta" htmlFor="s-email" error={fe.email} required>
            <Input id="s-email" name="email" type="email" defaultValue={v.email} aria-invalid={!!fe.email} />
          </Field>
          <Field label="Telefon" htmlFor="s-phone" error={fe.phone} required>
            <Input id="s-phone" name="phone" type="tel" defaultValue={v.phone} aria-invalid={!!fe.phone} />
          </Field>
          <Field label="Şube" htmlFor="s-branch" error={fe.branchId} required className="sm:col-span-2">
            <Select id="s-branch" name="branchId" defaultValue={v.branchId ?? ""} aria-invalid={!!fe.branchId}>
              <option value="">Seçin</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Hesap Oluştur"}</Button>
            <Button type="button" variant="ghost" onClick={close}>Kapat</Button>
          </div>
        </form>
      )}
    </Toggle>
  );
}

export function TariffForm({ tariff }: { tariff: TariffRow[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateTariffAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.values?.ok && <Alert tone="success">Tarife güncellendi. Yeni fiyatlar oluşturulacak gönderilere uygulanır.</Alert>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Desi aralığı</th>
              <th className="px-4 py-3">Ücret (TL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tariff.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <label htmlFor={`t-${r.id}`} className="font-medium text-slate-800">{r.label}</label>
                </td>
                <td className="px-4 py-3">
                  <Input id={`t-${r.id}`} name={r.id} type="number" step="0.01" min="0" defaultValue={r.price} className="max-w-36" aria-invalid={!!fe[r.id]} />
                  {fe[r.id] && <p className="mt-1 text-xs text-rose-600">{fe[r.id]}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Tarifeyi Kaydet"}</Button>
    </form>
  );
}
