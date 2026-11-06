"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { rateAction } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";

function Stars({ name, label, value, onChange }: { name: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <Star
              size={30}
              aria-hidden
              className={`${n <= value ? "fill-accent-500 text-accent-500" : "text-slate-300"} rounded peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500`}
            />
            <span className="sr-only">{n} yıldız</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Teslimat ve kurye puanlama (FR-18) */
export function RatingForm({ trackingNo }: { trackingNo: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(rateAction, {});
  const [delivery, setDelivery] = useState(0);
  const [courier, setCourier] = useState(0);

  if (state.values?.ok) return <Alert tone="success">Değerlendirmeniz için teşekkür ederiz!</Alert>;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Stars name="delivery" label="Teslimat süreci" value={delivery} onChange={setDelivery} />
        <Stars name="courier" label="Kurye" value={courier} onChange={setCourier} />
      </div>
      <Field label="Yorum (isteğe bağlı)" htmlFor="comment">
        <Textarea id="comment" name="comment" rows={2} maxLength={300} />
      </Field>
      <Button type="submit" disabled={pending || !delivery || !courier}>
        {pending ? "Gönderiliyor…" : "Değerlendir"}
      </Button>
    </form>
  );
}
