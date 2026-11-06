import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { getBranch } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { MAIN_FLOW, STATUS_LABEL, flowIndex } from "@/lib/status";
import type { Shipment } from "@/lib/types";

/** Üstte yatay ilerleme adımları */
export function ProgressSteps({ shipment }: { shipment: Shipment }) {
  const current = flowIndex(shipment.status);
  const failed = shipment.status === "TESLIM_EDILEMEDI" || shipment.status === "IADE";
  return (
    <ol className="grid grid-cols-3 gap-y-4 sm:grid-cols-6" aria-label="Gönderi ilerlemesi">
      {MAIN_FLOW.map((s, i) => {
        const done = i < current || (i === current && !failed);
        const isFailHere = failed && i === current;
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                isFailHere
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : done
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 bg-white text-slate-400"
              }`}
              aria-current={i === current ? "step" : undefined}
            >
              {isFailHere ? <XCircle size={18} /> : done ? <CheckCircle2 size={18} /> : <Circle size={14} />}
            </span>
            <span className={`mt-2 px-1 text-xs leading-tight ${i <= current ? "font-medium text-slate-800" : "text-slate-400"}`}>
              {isFailHere ? STATUS_LABEL[shipment.status] : STATUS_LABEL[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Tarih–saat–konum bilgisiyle durum geçmişi (FR-09) */
export function StatusTimeline({ shipment }: { shipment: Shipment }) {
  const items = [...shipment.history].reverse();
  return (
    <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6">
      {items.map((e, i) => {
        const branch = e.branchId ? getBranch(e.branchId) : undefined;
        const bad = e.status === "TESLIM_EDILEMEDI";
        return (
          <li key={`${e.status}-${e.date}`} className="relative">
            <span
              className={`absolute -left-[33px] top-0.5 h-4 w-4 rounded-full border-2 border-white ring-2 ${
                i === 0 ? (bad ? "bg-rose-500 ring-rose-200" : "bg-brand-600 ring-brand-200") : "bg-slate-300 ring-slate-100"
              }`}
              aria-hidden
            />
            <p className={`font-semibold ${i === 0 ? "text-slate-900" : "text-slate-700"}`}>{STATUS_LABEL[e.status]}</p>
            <p className="text-sm text-slate-500">
              <time dateTime={e.date}>{formatDateTime(e.date)}</time>
              {branch && <> · {branch.name}</>}
            </p>
            {e.note && <p className="mt-1 text-sm text-slate-600">{e.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
