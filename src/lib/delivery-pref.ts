/** Alıcı kontrolü ("Kargom yolda, planım değişti") için ortak tanımlar */
import type { DeliveryOption, Shipment, ShipmentStatus } from "./types";

export const PREF_LABEL: Record<DeliveryOption, string> = {
  ADRES: "Adresime teslim edilsin",
  BASKA_GUN: "Başka bir gün getirilsin",
  SUBEDEN: "Şubeden kendim alacağım",
  KOMSU: "Komşuma bırakılsın",
  YESIL_GUN: "Yeşil teslimat günü",
};

/** Kurye / şube ekranlarındaki kısa etiket */
export const PREF_SHORT: Record<DeliveryOption, string> = {
  ADRES: "Adrese teslim",
  BASKA_GUN: "İleri tarih",
  SUBEDEN: "Şubeden alacak",
  KOMSU: "Komşuya bırakılabilir",
  YESIL_GUN: "Yeşil gün",
};

export const PREF_DESC: Record<DeliveryOption, string> = {
  ADRES: "Kurye kargonuzu tahmini teslim gününde adresinize getirir.",
  BASKA_GUN: "Evde olmayacaksanız uygun olduğunuz iş gününü seçin.",
  SUBEDEN: "Kargonuz varış şubesinde bekler; kodunuzu söyleyerek teslim alırsınız.",
  KOMSU: "Evde yoksanız kurye kargoyu belirttiğiniz komşunuza bırakır.",
  YESIL_GUN: "Acil değilse mahallenize haftada bir yapılan toplu dağıtıma eklenir.",
};

/** Tercih yalnızca kargo dağıtıma çıkmadan önce değiştirilebilir */
const EDITABLE: ShipmentStatus[] = ["OLUSTURULDU", "SUBEYE_TESLIM", "TRANSFER_MERKEZINDE", "VARIS_SUBESINDE", "TESLIM_EDILEMEDI"];
export const canEditPref = (s: Shipment) => EDITABLE.includes(s.status);

/** Telefon numarasının son 4 hanesi (alıcı doğrulaması için) */
export const phoneLast4 = (phone: string) => phone.replace(/\D/g, "").slice(-4);
