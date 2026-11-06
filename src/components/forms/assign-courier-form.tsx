"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { assignCourierAction } from "@/app/actions/shipments";
import { StatusBadge } from "@/components/shipment/status-badge";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import type { ShipmentStatus } from "@/lib/types";

interface Row {
  trackingNo: string;
  receiver: string;
  district: string;
  status: ShipmentStatus;
  /** Alıcının teslimat tercihi (ileri tarih, komşu, yeşil gün) */
  pref?: { label: string; detail?: string; green: boolean };
}

export function AssignCourierForm({ rows, couriers }: { rows: Row[]; couriers: { id: string; name: string; active: number }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(assignCourierAction, {});
  const [selected, setSelected] = useState<string[]>([]);

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const toggle = (no: string) => setSelected((s) => (s.includes(no) ? s.filter((x) => x !== no) : [...s, no]));

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.values?.ok && (
        <Alert tone="success">
          {state.values.ok} gönderi kuryeye atandı. Alıcılara teslimat doğrulama kodu e-postayla gönderildi.
        </Alert>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Atanacak gönderi yok" description="Varış şubesine ulaşan gönderiler burada listelenir." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Tümünü seç"
                    checked={allChecked}
                    onChange={() => setSelected(allChecked ? [] : rows.map((r) => r.trackingNo))}
                    className="h-4 w-4"
                  />
                </th>
                <th className="px-4 py-3">Takip No</th>
                <th className="px-4 py-3">Alıcı</th>
                <th className="px-4 py-3">İlçe</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Alıcı tercihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.trackingNo} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name="trackingNo"
                      value={r.trackingNo}
                      checked={selected.includes(r.trackingNo)}
                      onChange={() => toggle(r.trackingNo)}
                      aria-label={`${r.trackingNo} seç`}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{r.trackingNo}</td>
                  <td className="px-4 py-3">{r.receiver}</td>
                  <td className="px-4 py-3">{r.district}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.pref ? (
                      <span className={`text-xs font-medium ${r.pref.green ? "text-emerald-700" : "text-sky-700"}`}>
                        {r.pref.label}
                        {r.pref.detail && <span className="block font-normal text-slate-500">{r.pref.detail}</span>}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Kurye" htmlFor="courierId" className="min-w-60">
          <Select id="courierId" name="courierId" defaultValue="">
            <option value="" disabled>
              Kurye seçin
            </option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.active} aktif teslimat)
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" disabled={pending || selected.length === 0}>
          {pending ? "Atanıyor…" : `Seçili ${selected.length} gönderiyi ata`}
        </Button>
      </div>
    </form>
  );
}
