"use client";

import { ShieldCheck, TriangleAlert } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { branchDeliverAction, deliverAction, failDeliveryAction } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FAIL_REASONS } from "@/lib/status";

/** Teslimatı doğrulama koduyla tamamlama (FR-15) */
export function DeliverForm({ trackingNo, demoCode, at = "adres" }: { trackingNo: string; demoCode?: string; at?: "adres" | "sube" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(at === "sube" ? branchDeliverAction : deliverAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Alıcıdan alınan 6 haneli doğrulama kodu" htmlFor="code" error={state.fieldErrors?.code} required>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="\d{6}"
          placeholder="••••••"
          className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          aria-invalid={!!state.fieldErrors?.code}
        />
      </Field>
      {demoCode && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Demo: Alıcının e-postasına gönderilen kod <strong className="font-mono">{demoCode}</strong>. (Gerçek sistemde {at === "sube" ? "personel" : "kurye"} bu kodu göremez.)
        </p>
      )}
      <Button type="submit" variant="success" size="lg" className="w-full" disabled={pending}>
        <ShieldCheck size={20} aria-hidden /> {pending ? "Kontrol ediliyor…" : "Teslimatı Tamamla"}
      </Button>
    </form>
  );
}

/** Teslim edilemedi kaydı (FR-16) */
export function FailDeliveryForm({ trackingNo }: { trackingNo: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(failDeliveryAction, {});
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <TriangleAlert size={18} aria-hidden /> Teslim Edilemedi Olarak İşaretle
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Neden" htmlFor="reason" error={state.fieldErrors?.reason} required>
        <Select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!state.fieldErrors?.reason}>
          <option value="" disabled>
            Neden seçin
          </option>
          {FAIL_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
      </Field>
      <Field label="Açıklama" htmlFor="detail" error={state.fieldErrors?.detail} hint={reason === "Diğer" ? "Zorunlu" : "İsteğe bağlı"}>
        <Textarea id="detail" name="detail" rows={2} maxLength={200} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
