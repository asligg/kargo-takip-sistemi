"use client";

import { Leaf } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { createShipmentAction } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { Alert, Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { estimateCo2, formatKg, maxDiscount } from "@/lib/green";
import { calcDesi, calcPrice, formatTL } from "@/lib/price";
import type { Address, Branch, Party, TariffRow } from "@/lib/types";

interface Props {
  by: "musteri" | "sube";
  branches: Branch[];
  tariff: TariffRow[];
  addresses?: Address[];
  defaultSender?: Partial<Party>;
  fixedOriginId?: string;
  /** Müşterinin yeşil puanı (indirim olarak kullanılabilir) */
  greenPoints?: number;
}

const CITY_OF = (branches: Branch[], id: string) => branches.find((b) => b.id === id)?.city;

function PartyFields({
  prefix,
  title,
  cities,
  state,
  initial,
  addresses,
}: {
  prefix: "sender" | "receiver";
  title: string;
  cities: string[];
  state: FormState;
  initial?: Partial<Party>;
  addresses?: Address[];
}) {
  const [p, setP] = useState<Partial<Party>>(() => {
    const v = state.values;
    if (!v) return initial ?? {};
    return { name: v[`${prefix}_name`], phone: v[`${prefix}_phone`], email: v[`${prefix}_email`], city: v[`${prefix}_city`], district: v[`${prefix}_district`], address: v[`${prefix}_address`] };
  });
  const fe = state.fieldErrors ?? {};
  const id = (k: string) => `${prefix}_${k}`;
  const set = (k: keyof Party) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP({ ...p, [k]: e.target.value });

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          addresses && addresses.length > 0 ? (
            <Select
              aria-label="Adres defterinden seç"
              className="w-auto"
              defaultValue=""
              onChange={(e) => {
                const a = addresses.find((x) => x.id === e.target.value);
                if (a) setP(a.party);
              }}
            >
              <option value="">Adres defterinden seç…</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} – {a.party.name}
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad" htmlFor={id("name")} error={fe[id("name")]} required>
          <Input id={id("name")} name={id("name")} value={p.name ?? ""} onChange={set("name")} aria-invalid={!!fe[id("name")]} />
        </Field>
        <Field label="Telefon" htmlFor={id("phone")} error={fe[id("phone")]} required>
          <Input id={id("phone")} name={id("phone")} type="tel" placeholder="05XX XXX XX XX" value={p.phone ?? ""} onChange={set("phone")} aria-invalid={!!fe[id("phone")]} />
        </Field>
        <Field
          label="E-posta"
          htmlFor={id("email")}
          error={fe[id("email")]}
          required={prefix === "receiver"}
          hint={prefix === "receiver" ? "Durum bildirimleri ve teslimat doğrulama kodu bu adrese gönderilir." : undefined}
          className="sm:col-span-2"
        >
          <Input id={id("email")} name={id("email")} type="email" value={p.email ?? ""} onChange={set("email")} aria-invalid={!!fe[id("email")]} />
        </Field>
        <Field label="Şehir" htmlFor={id("city")} error={fe[id("city")]} required>
          <Select id={id("city")} name={id("city")} value={p.city ?? ""} onChange={set("city")} aria-invalid={!!fe[id("city")]}>
            <option value="">Seçin</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="İlçe" htmlFor={id("district")} error={fe[id("district")]} required>
          <Input id={id("district")} name={id("district")} value={p.district ?? ""} onChange={set("district")} aria-invalid={!!fe[id("district")]} />
        </Field>
        <Field label="Açık adres" htmlFor={id("address")} error={fe[id("address")]} required className="sm:col-span-2">
          <Textarea id={id("address")} name={id("address")} rows={2} value={p.address ?? ""} onChange={set("address")} aria-invalid={!!fe[id("address")]} />
        </Field>
      </CardBody>
    </Card>
  );
}

/** Gönderi oluşturma formu (FR-05..FR-07); müşteri ve şube personeli ortak kullanır */
export function ShipmentForm({ by, branches, tariff, addresses, defaultSender, fixedOriginId, greenPoints = 0 }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(createShipmentAction, {});
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};
  const cities = [...new Set(branches.map((b) => b.city))].sort((a, b) => a.localeCompare(b, "tr"));
  const shopBranches = branches.filter((b) => b.type === "sube");

  const [origin, setOrigin] = useState(fixedOriginId ?? v.originBranchId ?? "");
  const [dest, setDest] = useState(v.destBranchId ?? "");
  const [weight, setWeight] = useState(v.weightKg ?? "1");
  const [dims, setDims] = useState({ w: "", h: "", l: "" });
  const [desiManual, setDesiManual] = useState(v.desi ?? "");

  const desi = desiManual !== "" ? Number(desiManual) : calcDesi(+dims.w, +dims.h, +dims.l);
  const ready = origin && dest;
  const price = ready ? calcPrice(+weight, desi, CITY_OF(branches, origin) === CITY_OF(branches, dest), tariff) : null;
  const [useGreen, setUseGreen] = useState(false);
  const discount = price && useGreen ? maxDiscount(greenPoints, price.total) : null;
  const ob = branches.find((b) => b.id === origin);
  const db = branches.find((b) => b.id === dest);
  const co2 = ob && db ? estimateCo2(ob, db, +weight || 0, desi) : null;

  return (
    <form action={action} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <input type="hidden" name="by" value={by} />
      <div className="space-y-6">
        {Object.keys(fe).length > 0 && <Alert tone="error">Lütfen işaretli alanları düzeltin.</Alert>}
        <PartyFields prefix="sender" title="Gönderici bilgileri" cities={cities} state={state} initial={defaultSender} addresses={addresses} />
        <PartyFields prefix="receiver" title="Alıcı bilgileri" cities={cities} state={state} addresses={addresses} />

        <Card>
          <CardHeader title="Paket ve şube bilgileri" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Gönderi türü" htmlFor="type">
              <Select id="type" name="type" defaultValue={v.type ?? "koli"}>
                <option value="koli">Koli / Paket</option>
                <option value="dosya">Dosya / Evrak</option>
              </Select>
            </Field>
            <Field label="Ağırlık (kg)" htmlFor="weightKg" error={fe.weightKg} required>
              <Input id="weightKg" name="weightKg" type="number" step="0.1" min="0" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} aria-invalid={!!fe.weightKg} />
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Ölçüler (cm) — en × boy × yükseklik</span>
              <div className="grid grid-cols-3 gap-2">
                {(["w", "h", "l"] as const).map((k) => (
                  <Input
                    key={k}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    aria-label={{ w: "En (cm)", h: "Boy (cm)", l: "Yükseklik (cm)" }[k]}
                    placeholder={{ w: "En", h: "Boy", l: "Yükseklik" }[k]}
                    value={dims[k]}
                    onChange={(e) => {
                      setDesiManual("");
                      setDims({ ...dims, [k]: e.target.value });
                    }}
                  />
                ))}
              </div>
            </div>
            <Field label="Desi" htmlFor="desi" error={fe.desi} hint="Ölçülerden otomatik hesaplanır; isterseniz elle girebilirsiniz.">
              <Input id="desi" name="desi" type="number" step="0.1" min="0" value={desiManual !== "" ? desiManual : String(desi)} onChange={(e) => setDesiManual(e.target.value)} />
            </Field>
            <Field label="İçerik (isteğe bağlı)" htmlFor="description">
              <Input id="description" name="description" defaultValue={v.description} placeholder="ör. Kitap" />
            </Field>
            {fixedOriginId ? (
              <input type="hidden" name="originBranchId" value={fixedOriginId} />
            ) : (
              <Field label="Teslim edeceğiniz şube" htmlFor="originBranchId" error={fe.originBranchId} required>
                <Select id="originBranchId" name="originBranchId" value={origin} onChange={(e) => setOrigin(e.target.value)} aria-invalid={!!fe.originBranchId}>
                  <option value="">Seçin</option>
                  {shopBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Varış şubesi" htmlFor="destBranchId" error={fe.destBranchId} required>
              <Select id="destBranchId" name="destBranchId" value={dest} onChange={(e) => setDest(e.target.value)} aria-invalid={!!fe.destBranchId}>
                <option value="">Seçin</option>
                {shopBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card className="overflow-hidden">
          <div className="bg-brand-900 p-5 text-white" aria-live="polite">
            <p className="text-sm text-brand-200">Gönderi ücreti</p>
            <p className="mt-1 text-3xl font-bold">
              {price ? formatTL(price.total - (discount?.tl ?? 0)) : "—"}
              {discount && discount.tl > 0 && <span className="ml-2 text-base font-medium text-brand-200 line-through">{formatTL(price!.total)}</span>}
            </p>
            {price ? (
              <p className="mt-2 text-xs text-brand-200">
                {price.row.label} · ücrete esas {price.billable} {price.intercity > 0 && `· şehir dışı ek ${formatTL(price.intercity)}`}
              </p>
            ) : (
              <p className="mt-2 text-xs text-brand-200">Ücreti görmek için şubeleri seçin.</p>
            )}
          </div>
          <CardBody className="space-y-3">
            {co2 && (
              <p className="flex items-start gap-1.5 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900">
                <Leaf size={14} className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  Tahmini karbon ayak izi <strong>{formatKg(co2.total)} CO₂</strong>. Alıcı şubeden alırsa veya yeşil günü seçerse azalır.
                </span>
              </p>
            )}
            {by === "musteri" && greenPoints >= 10 && (
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-emerald-200 p-2.5 text-sm">
                <input type="checkbox" name="useGreenPoints" checked={useGreen} onChange={(e) => setUseGreen(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
                <span>
                  <span className="font-medium text-slate-900">Yeşil puanımı kullan</span>
                  <span className="block text-xs text-slate-500">
                    {greenPoints} puanınız var (10 puan = 1 TL, en fazla ücretin %20&apos;si).
                    {discount && discount.tl > 0 && ` ${discount.points} puan ile ${formatTL(discount.tl)} indirim.`}
                  </span>
                </span>
              </label>
            )}
            <p className="text-sm text-slate-600">
              Onayladığınızda gönderiniz için <strong>takip numarası</strong> ve <strong>QR kod</strong> oluşturulur.
              {by === "musteri"
                ? " Paketinizi şubeye götürüp QR kodu telefonunuzdan göstermeniz yeterli; etiket şubede basılır."
                : " Etiketi yazdırıp pakete yapıştırın."}
            </p>
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Oluşturuluyor…" : by === "sube" ? "Gönderiyi Kabul Et" : "Gönderiyi Oluştur"}
            </Button>
          </CardBody>
        </Card>
      </aside>
    </form>
  );
}
