"use client";

import { Calculator } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { calcDesi, calcPrice, formatTL } from "@/lib/price";
import type { TariffRow } from "@/lib/types";

/** Herkese açık ücret hesaplayıcı (FR-07) */
export function PriceCalculator({ tariff, cities }: { tariff: TariffRow[]; cities: string[] }) {
  const [from, setFrom] = useState(cities[0] ?? "");
  const [to, setTo] = useState(cities[1] ?? cities[0] ?? "");
  const [weight, setWeight] = useState("1");
  const [dims, setDims] = useState({ w: "20", h: "15", l: "10" });

  const desi = calcDesi(+dims.w, +dims.h, +dims.l);
  const p = calcPrice(+weight, desi, from === to, tariff);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Çıkış şehri" htmlFor="from">
          <Select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Varış şehri" htmlFor="to">
          <Select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ağırlık (kg)" htmlFor="weight">
          <Input id="weight" type="number" min="0" step="0.1" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Ölçüler (cm) — en × boy × yükseklik</span>
          <div className="grid grid-cols-3 gap-2">
            {(["w", "h", "l"] as const).map((k) => (
              <Input
                key={k}
                aria-label={{ w: "En (cm)", h: "Boy (cm)", l: "Yükseklik (cm)" }[k]}
                type="number"
                min="0"
                inputMode="numeric"
                value={dims[k]}
                onChange={(e) => setDims({ ...dims, [k]: e.target.value })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-brand-900 p-5 text-white" aria-live="polite">
        <div className="flex items-center gap-2 text-brand-200">
          <Calculator size={18} aria-hidden /> Tahmini ücret
        </div>
        <p className="mt-2 text-4xl font-bold">{formatTL(p.total)}</p>
        <dl className="mt-4 space-y-1.5 text-sm text-brand-100">
          <div className="flex justify-between">
            <dt>Desi</dt>
            <dd>{desi}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Ücrete esas (kg/desi)</dt>
            <dd>{p.billable}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tarife ({p.row.label})</dt>
            <dd>{formatTL(p.base)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Şehir dışı ek ücret</dt>
            <dd>{formatTL(p.intercity)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-brand-300">Ağırlık ile desiden büyük olan değer ücretlendirmeye esas alınır.</p>
      </div>
    </div>
  );
}
