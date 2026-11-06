import { getBranch } from "./data";
import { formatDate, formatDateTime, maskName } from "./format";
import { STATUS_LABEL } from "./status";
import type { Shipment } from "./types";

/** Takip numarasını harf harf okunacak biçime çevirir: "KT2026110301" → "K T 2 0 2 6 1 1 0 3 0 1" */
const spell = (no: string) => no.split("").join(" ");

/**
 * Erişilebilir takip modu için gönderi durumunun sesli okunacak özeti (Web Speech API).
 * Takip sayfası herkese açık olduğundan adlar burada da kısaltılır.
 */
export function shipmentSpeech(s: Shipment): string {
  const last = s.history.at(-1)!;
  const branch = last.branchId ? getBranch(last.branchId)?.name : undefined;
  const parts = [
    `${spell(s.trackingNo)} numaralı kargonuzun durumu: ${STATUS_LABEL[s.status]}.`,
    `Son hareket ${formatDateTime(last.date)}${branch ? `, ${branch}` : ""}.`,
  ];

  if (s.status === "DAGITIMDA") parts.push("Kargonuz bugün kurye ile adresinize getirilecek. Teslimat için e-postanıza gönderilen 6 haneli kodu kuryeye söyleyin.");
  else if (s.status === "TESLIM_EDILDI") parts.push(`Kargonuz ${maskName(s.receiver.name)} adlı alıcıya teslim edildi.`);
  else if (s.status === "TESLIM_EDILEMEDI") parts.push(`Kargonuz teslim edilemedi. ${last.note ?? ""} Kurye bir sonraki iş günü tekrar deneyecek.`);
  else if (s.status !== "IADE") parts.push(`Tahmini teslim tarihi ${formatDate(s.estimatedDelivery)}.`);

  return parts.join(" ");
}
