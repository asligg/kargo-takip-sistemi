import type { ShipmentStatus } from "./types";

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  OLUSTURULDU: "Gönderi Oluşturuldu",
  SUBEYE_TESLIM: "Şubeye Teslim Edildi",
  TRANSFER_MERKEZINDE: "Transfer Merkezinde",
  VARIS_SUBESINDE: "Varış Şubesinde",
  DAGITIMDA: "Dağıtımda",
  TESLIM_EDILDI: "Teslim Edildi",
  TESLIM_EDILEMEDI: "Teslim Edilemedi",
  IADE: "İade Sürecinde",
};

/** Rozet renkleri (Tailwind sınıfları) */
export const STATUS_STYLE: Record<ShipmentStatus, string> = {
  OLUSTURULDU: "bg-slate-100 text-slate-700 ring-slate-200",
  SUBEYE_TESLIM: "bg-sky-50 text-sky-700 ring-sky-200",
  TRANSFER_MERKEZINDE: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  VARIS_SUBESINDE: "bg-violet-50 text-violet-700 ring-violet-200",
  DAGITIMDA: "bg-amber-50 text-amber-800 ring-amber-200",
  TESLIM_EDILDI: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  TESLIM_EDILEMEDI: "bg-rose-50 text-rose-700 ring-rose-200",
  IADE: "bg-orange-50 text-orange-700 ring-orange-200",
};

/** Ana akış sırası (ilerleme çubuğu için) */
export const MAIN_FLOW: ShipmentStatus[] = [
  "OLUSTURULDU",
  "SUBEYE_TESLIM",
  "TRANSFER_MERKEZINDE",
  "VARIS_SUBESINDE",
  "DAGITIMDA",
  "TESLIM_EDILDI",
];

/** Şube personelinin QR okuttuktan sonra seçebileceği sonraki durumlar */
export const BRANCH_NEXT: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  OLUSTURULDU: ["SUBEYE_TESLIM"],
  SUBEYE_TESLIM: ["TRANSFER_MERKEZINDE"],
  TRANSFER_MERKEZINDE: ["VARIS_SUBESINDE"],
  TESLIM_EDILEMEDI: ["VARIS_SUBESINDE", "IADE"],
};

export function flowIndex(s: ShipmentStatus): number {
  if (s === "TESLIM_EDILEMEDI") return MAIN_FLOW.indexOf("DAGITIMDA");
  if (s === "IADE") return MAIN_FLOW.indexOf("VARIS_SUBESINDE");
  return MAIN_FLOW.indexOf(s);
}

export const FAIL_REASONS = [
  "Alıcı adreste bulunamadı",
  "Adres hatalı veya eksik",
  "Alıcı teslimatı reddetti",
  "Doğrulama kodu alınamadı",
  "Diğer",
];
