"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { updateStatusAction } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { STATUS_LABEL } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";

export function StatusUpdateForm({
  trackingNo,
  options,
  transfers,
}: {
  trackingNo: string;
  options: ShipmentStatus[];
  transfers: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateStatusAction, {});
  const [picked, setPicked] = useState<ShipmentStatus | "">("");
  // Güncelleme sonrası seçenekler sunucudan yenilenir; seçili değer geçersizse ilk seçenek kullanılır
  const status = picked && options.includes(picked) ? picked : (options[0] ?? "");
  const setStatus = setPicked;

  const success = state.values?.ok && (
    <Alert tone="success">
      <span className="flex items-center gap-2 font-medium">
        <CheckCircle2 size={18} aria-hidden /> Durum güncellendi. Alıcıya e-posta bildirimi gönderildi.
      </span>
    </Alert>
  );

  if (options.length === 0) {
    return (
      <div className="space-y-3">
        {success}
        <Alert tone="info">Bu gönderi için şube tarafından yapılabilecek başka bir durum güncellemesi yok.</Alert>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {success}
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="trackingNo" value={trackingNo} />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Yeni durum</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
            >
              <input type="radio" name="status" value={o} checked={status === o} onChange={() => setStatus(o)} className="h-4 w-4 text-brand-600" />
              <span className="font-medium text-slate-800">{STATUS_LABEL[o]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {status === "TRANSFER_MERKEZINDE" && (
        <Field label="Transfer merkezi" htmlFor="transferId" required>
          <Select id="transferId" name="transferId">
            {transfers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Not (isteğe bağlı)" htmlFor="note">
        <Input id="note" name="note" maxLength={120} placeholder="ör. Paket hasarsız teslim alındı" />
      </Field>
      <Button type="submit" disabled={pending || !status} className="w-full sm:w-auto">
        {pending ? "Kaydediliyor…" : "Durumu Güncelle"}
      </Button>
    </form>
  );
}
