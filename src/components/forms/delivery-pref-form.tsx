"use client";

import { CalendarDays, Home, Leaf, Store, Users } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { setDeliveryPrefAction } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { PREF_DESC, PREF_LABEL } from "@/lib/delivery-pref";
import type { DeliveryOption, DeliveryPref } from "@/lib/types";

const ICON: Record<DeliveryOption, typeof Home> = { ADRES: Home, BASKA_GUN: CalendarDays, SUBEDEN: Store, KOMSU: Users, YESIL_GUN: Leaf };
const ORDER: DeliveryOption[] = ["ADRES", "BASKA_GUN", "SUBEDEN", "KOMSU", "YESIL_GUN"];

interface Props {
  trackingNo: string;
  current?: DeliveryPref;
  /** Üye olmayan alıcı için telefon doğrulaması istenir */
  requireLast4: boolean;
  workdays: { value: string; label: string }[];
  branchName: string;
  greenDateLabel: string;
  /** Seçeneğe göre son kilometrede tasarruf edilen CO₂ ("0,55 kg") ve kazanılacak puan */
  green: Partial<Record<DeliveryOption, { saved: string; points: number }>>;
}

/** Alıcı kontrolü: "Kargom yolda, planım değişti" */
export function DeliveryPrefForm({ trackingNo, current, requireLast4, workdays, branchName, greenDateLabel, green }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(setDeliveryPrefAction, {});
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};
  const [option, setOption] = useState<DeliveryOption>((v.option as DeliveryOption) ?? current?.option ?? "ADRES");

  return (
    <form action={action} noValidate className="space-y-4">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      {/* Seçim durumdan gönderilir: React form eylemi sonrası formu sıfırladığında radyo düğmeleri ilk değerine döner */}
      <input type="hidden" name="option" value={option} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {v.ok && <Alert tone="success">Tercihiniz kaydedildi; kurye ve şube ekranlarına iletildi. Onay e-postası gönderildi.</Alert>}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Kargonuz nasıl teslim edilsin?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ORDER.map((o) => {
            const Icon = ICON[o];
            const g = green[o];
            return (
              <label
                key={o}
                className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                  option === o ? (o === "YESIL_GUN" || o === "SUBEDEN" ? "border-emerald-500 bg-emerald-50/60" : "border-brand-500 bg-brand-50/60") : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input type="radio" name="option-secim" value={o} checked={option === o} onChange={() => setOption(o)} className="sr-only" />
                <Icon size={20} className={`mt-0.5 shrink-0 ${o === "YESIL_GUN" || o === "SUBEDEN" ? "text-emerald-600" : "text-brand-600"}`} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{PREF_LABEL[o]}</span>
                  <span className="block text-xs text-slate-500">{PREF_DESC[o]}</span>
                  {g && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      <Leaf size={11} aria-hidden /> {g.saved} CO₂ tasarruf · +{g.points} puan
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {option === "BASKA_GUN" && (
        <Field label="Teslim günü" htmlFor="date" error={fe.date} required>
          <Select id="date" name="date" defaultValue={v.date ?? current?.date ?? ""} aria-invalid={!!fe.date}>
            <option value="" disabled>
              Gün seçin
            </option>
            {workdays.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {option === "KOMSU" && (
        <Field label="Komşunuzun adı ve kapı numarası" htmlFor="neighbor" error={fe.neighbor} hint="Teslimat için doğrulama kodunu komşunuza iletmeyi unutmayın." required>
          <Input id="neighbor" name="neighbor" maxLength={60} placeholder="ör. Fatma Hanım, Daire 4" defaultValue={v.neighbor ?? current?.neighbor} aria-invalid={!!fe.neighbor} />
        </Field>
      )}
      {option === "SUBEDEN" && (
        <Alert tone="info">
          Kargonuz varış şubesine (<strong>{branchName}</strong>) ulaştığında bekletilir. Doğrulama kodunuz e-postanıza gönderilir; şubede kodu söyleyerek teslim alırsınız.
        </Alert>
      )}
      {option === "YESIL_GUN" && (
        <Alert tone="success">
          Mahallenizin toplu dağıtım günü: <strong>{greenDateLabel}</strong>. Kurye o gün sokağınızdaki tüm kargoları tek seferde getirir.
        </Alert>
      )}

      {requireLast4 && (
        <Field label="Doğrulama: telefon numaranızın son 4 hanesi" htmlFor="last4" error={fe.last4} hint="Tercihi yalnızca alıcının değiştirebilmesi için istenir." required>
          <Input id="last4" name="last4" inputMode="numeric" maxLength={4} className="w-32 font-mono tracking-widest" autoComplete="off" aria-invalid={!!fe.last4} />
        </Field>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Tercihi Kaydet"}
      </Button>
    </form>
  );
}
