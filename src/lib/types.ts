export type Role = "musteri" | "sube" | "kurye" | "yonetici";

export type ShipmentStatus =
  | "OLUSTURULDU"
  | "SUBEYE_TESLIM"
  | "TRANSFER_MERKEZINDE"
  | "VARIS_SUBESINDE"
  | "DAGITIMDA"
  | "TESLIM_EDILDI"
  | "TESLIM_EDILEMEDI"
  | "IADE";

export type BranchType = "sube" | "transfer";

export interface Branch {
  id: string;
  name: string;
  city: string;
  type: BranchType;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  /** Yeşil teslimat günü: şubenin mahallelere toplu dağıtım yaptığı gün (1 = Pazartesi … 5 = Cuma) */
  greenDay?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branchId?: string;
  active: boolean;
  /** Yeşil Kargo puanı (yalnızca müşteriler); 10 puan = 1 TL indirim */
  greenPoints?: number;
}

export interface Party {
  name: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  address: string;
  /** Adresin konumu (kurye rota optimizasyonu için; yoksa ilçe merkezi kullanılır) */
  lat?: number;
  lng?: number;
}

export interface PackageInfo {
  weightKg: number;
  desi: number;
  type: "dosya" | "koli";
  description?: string;
}

export interface StatusEvent {
  status: ShipmentStatus;
  date: string; // ISO
  branchId?: string;
  note?: string;
}

export interface Rating {
  delivery: number; // 1-5
  courier: number; // 1-5
  comment?: string;
}

export interface Shipment {
  trackingNo: string;
  customerId?: string;
  sender: Party;
  receiver: Party;
  pkg: PackageInfo;
  price: number;
  originBranchId: string;
  destBranchId: string;
  status: ShipmentStatus;
  courierId?: string;
  history: StatusEvent[];
  createdAt: string;
  estimatedDelivery: string;
  rating?: Rating;
  /** Alıcının teslimat tercihi ("Kargom yolda, planım değişti") */
  deliveryPref?: DeliveryPref;
  /** Gönderi oluşturulurken yeşil puanla düşülen indirim (TL) */
  greenDiscount?: number;
  /** Teslimatta alıcıya verilen yeşil puan */
  greenAwarded?: number;
}

/**
 * Alıcının teslimat seçenekleri:
 * ADRES (varsayılan), BASKA_GUN (ileri tarih), SUBEDEN (alıcı şubeden alır),
 * KOMSU (komşuya bırakılır), YESIL_GUN (mahalleye haftalık toplu dağıtım)
 */
export type DeliveryOption = "ADRES" | "BASKA_GUN" | "SUBEDEN" | "KOMSU" | "YESIL_GUN";

export interface DeliveryPref {
  option: DeliveryOption;
  date?: string; // BASKA_GUN ve YESIL_GUN için teslim günü (YYYY-MM-DD)
  neighbor?: string; // KOMSU için komşunun adı ve kapı numarası
  updatedAt: string;
}

export interface Address {
  id: string;
  title: string;
  party: Party;
}

export interface TariffRow {
  id: string;
  label: string;
  minDesi: number;
  maxDesi: number | null;
  price: number;
}
