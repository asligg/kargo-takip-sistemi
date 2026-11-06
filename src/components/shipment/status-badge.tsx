import { STATUS_LABEL, STATUS_STYLE } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
