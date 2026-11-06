"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, requireRole } from "@/lib/auth";
import { canEditPref, phoneLast4 } from "@/lib/delivery-pref";
import { maxDiscount, nextWorkdays } from "@/lib/green";
import {
  assignCourier,
  completeDelivery,
  createShipment,
  failDelivery,
  getBranch,
  getShipment,
  getTariff,
  getUser,
  isPickupReady,
  rateShipment,
  setDeliveryPref,
  spendGreenPoints,
  updateStatus,
} from "@/lib/data";
import { calcPrice } from "@/lib/price";
import { BRANCH_NEXT } from "@/lib/status";
import type { DeliveryOption, Party, ShipmentStatus } from "@/lib/types";
import type { FormState } from "./auth";

const PHONE_RE = /^0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

function readParty(f: FormData, p: "sender" | "receiver"): Party {
  const g = (k: string) => String(f.get(`${p}_${k}`) ?? "").trim();
  return { name: g("name"), phone: g("phone"), email: g("email") || undefined, city: g("city"), district: g("district"), address: g("address") };
}

function validateParty(party: Party, p: string, errors: Record<string, string>) {
  if (party.name.length < 3) errors[`${p}_name`] = "Ad soyad zorunludur.";
  if (!PHONE_RE.test(party.phone)) errors[`${p}_phone`] = "Telefonu 05XX XXX XX XX biçiminde girin.";
  if (party.email && !/^\S+@\S+\.\S+$/.test(party.email)) errors[`${p}_email`] = "Geçerli bir e-posta girin.";
  if (!party.city) errors[`${p}_city`] = "Şehir seçin.";
  if (!party.district) errors[`${p}_district`] = "İlçe zorunludur.";
  if (party.address.length < 10) errors[`${p}_address`] = "Açık adresi girin (en az 10 karakter).";
}

/** Gönderi oluşturma (FR-05, FR-06, FR-07) — müşteri veya şube personeli */
export async function createShipmentAction(_prev: FormState, f: FormData): Promise<FormState> {
  const by = String(f.get("by")) === "sube" ? "sube" : "musteri";
  const user = await requireRole(by);

  const sender = readParty(f, "sender");
  const receiver = readParty(f, "receiver");
  const weightKg = Number(f.get("weightKg"));
  const desi = Number(f.get("desi"));
  const originBranchId = by === "sube" ? user.branchId! : String(f.get("originBranchId"));
  const destBranchId = String(f.get("destBranchId"));

  const errors: Record<string, string> = {};
  validateParty(sender, "sender", errors);
  validateParty(receiver, "receiver", errors);
  if (!receiver.email) errors.receiver_email = "Bildirim ve doğrulama kodu için alıcı e-postası zorunludur.";
  if (!(weightKg > 0) || weightKg > 100) errors.weightKg = "Ağırlık 0–100 kg arasında olmalıdır.";
  if (!(desi >= 0)) errors.desi = "Desi değeri geçersiz.";
  if (!getBranch(originBranchId)) errors.originBranchId = "Çıkış şubesi seçin.";
  if (!getBranch(destBranchId)) errors.destBranchId = "Varış şubesi seçin.";
  if (Object.keys(errors).length) {
    return { fieldErrors: errors, values: Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)])) };
  }

  const sameCity = getBranch(originBranchId)!.city === getBranch(destBranchId)!.city;
  let price = calcPrice(weightKg, desi, sameCity, getTariff()).total;
  // Yeşil Kargo: müşteri biriken puanını indirim olarak kullanabilir
  let greenDiscount: number | undefined;
  if (by === "musteri" && f.get("useGreenPoints") === "on") {
    const d = maxDiscount(user.greenPoints ?? 0, price);
    if (d.tl > 0) {
      spendGreenPoints(user.id, d.points);
      greenDiscount = d.tl;
      price -= d.tl;
    }
  }
  const s = createShipment({
    greenDiscount,
    customerId: by === "musteri" ? user.id : undefined,
    sender,
    receiver,
    pkg: { weightKg, desi, type: f.get("type") === "dosya" ? "dosya" : "koli", description: String(f.get("description") ?? "") || undefined },
    price,
    originBranchId,
    destBranchId,
  });
  // Şubede oluşturulan gönderi doğrudan şubeye teslim alınmış sayılır
  if (by === "sube") updateStatus(s.trackingNo, "SUBEYE_TESLIM", originBranchId, "Gönderi şubede kabul edildi.");

  revalidatePath("/", "layout");
  redirect(by === "sube" ? `/sube/gonderi/${s.trackingNo}?yeni=1` : `/musteri/gonderi/${s.trackingNo}?yeni=1`);
}

/** QR okutma sonrası durum güncelleme (FR-12) */
export async function updateStatusAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("sube");
  const no = String(f.get("trackingNo"));
  const status = String(f.get("status")) as ShipmentStatus;
  const s = getShipment(no);
  if (!s) return { error: "Gönderi bulunamadı." };
  if (!BRANCH_NEXT[s.status]?.includes(status)) return { error: "Bu gönderi için seçilen durum geçişine izin verilmiyor." };

  let branchId = user.branchId;
  if (status === "TRANSFER_MERKEZINDE") branchId = String(f.get("transferId") || "") || undefined;
  if (status === "VARIS_SUBESINDE") branchId = s.destBranchId;
  updateStatus(no, status, branchId, String(f.get("note") ?? "") || undefined);
  revalidatePath("/", "layout");
  return { values: { ok: "1", trackingNo: no } };
}

/** Kuryeye atama (FR-13, FR-14) */
export async function assignCourierAction(_prev: FormState, f: FormData): Promise<FormState> {
  await requireRole("sube");
  const courierId = String(f.get("courierId") ?? "");
  const nos = f.getAll("trackingNo").map(String);
  if (!getUser(courierId)) return { error: "Lütfen bir kurye seçin." };
  if (nos.length === 0) return { error: "En az bir gönderi seçin." };
  assignCourier(nos, courierId);
  revalidatePath("/", "layout");
  return { values: { ok: String(nos.length) } };
}

/** Doğrulama kodlu teslimat (FR-15) */
export async function deliverAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("kurye");
  const no = String(f.get("trackingNo"));
  const code = String(f.get("code") ?? "").replace(/\D/g, "");
  if (getShipment(no)?.courierId !== user.id) return { error: "Bu gönderi size atanmamış." };
  if (code.length !== 6) return { fieldErrors: { code: "Doğrulama kodu 6 haneli olmalıdır." } };
  const r = completeDelivery(no, code);
  if (!r.ok) return { error: r.error };
  revalidatePath("/", "layout");
  redirect(`/kurye?teslim=${no}`);
}

/** Şubeden teslim: alıcı "şubeden alacağım" dedi, personel doğrulama koduyla teslim eder */
export async function branchDeliverAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("sube");
  const no = String(f.get("trackingNo"));
  const code = String(f.get("code") ?? "").replace(/\D/g, "");
  const s = getShipment(no);
  if (!s || s.destBranchId !== user.branchId || !isPickupReady(s)) return { error: "Bu gönderi şubenizde teslime hazır değil." };
  if (code.length !== 6) return { fieldErrors: { code: "Doğrulama kodu 6 haneli olmalıdır." } };
  const r = completeDelivery(no, code, "sube");
  if (!r.ok) return { error: r.error };
  revalidatePath("/", "layout");
  redirect(`/sube/gonderi/${no}?teslim=1`);
}

const OPTIONS: DeliveryOption[] = ["ADRES", "BASKA_GUN", "SUBEDEN", "KOMSU", "YESIL_GUN"];

/**
 * Alıcı kontrolü: teslimat tercihini değiştirme.
 * Üye alıcı oturumuyla, üye olmayan alıcı ise telefon numarasının son 4 hanesiyle doğrulanır.
 */
export async function setDeliveryPrefAction(_prev: FormState, f: FormData): Promise<FormState> {
  const no = String(f.get("trackingNo"));
  const s = getShipment(no);
  if (!s) return { error: "Gönderi bulunamadı." };
  if (!canEditPref(s)) return { error: "Kargonuz dağıtıma çıktığı için teslimat tercihi artık değiştirilemez." };

  const values = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));
  const user = await getSessionUser();
  const isReceiver = user?.role === "musteri" && user.email.toLowerCase() === s.receiver.email?.toLowerCase();
  if (!isReceiver) {
    const last4 = String(f.get("last4") ?? "").replace(/\D/g, "");
    if (last4 !== phoneLast4(s.receiver.phone)) return { fieldErrors: { last4: "Telefon numarası eşleşmedi." }, values };
  }

  const option = String(f.get("option")) as DeliveryOption;
  if (!OPTIONS.includes(option)) return { fieldErrors: { option: "Bir seçenek belirleyin." }, values };
  const date = String(f.get("date") ?? "");
  const neighbor = String(f.get("neighbor") ?? "").trim();
  if (option === "BASKA_GUN" && !nextWorkdays().includes(date)) return { fieldErrors: { date: "Listeden bir gün seçin." }, values };
  if (option === "KOMSU" && neighbor.length < 5) return { fieldErrors: { neighbor: "Komşunuzun adını ve kapı numarasını yazın." }, values };

  setDeliveryPref(no, { option, date: option === "BASKA_GUN" ? date : undefined, neighbor: option === "KOMSU" ? neighbor : undefined });
  revalidatePath("/", "layout");
  return { values: { ...values, ok: "1" } };
}

/** Teslim edilemedi kaydı (FR-16) */
export async function failDeliveryAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("kurye");
  const no = String(f.get("trackingNo"));
  const reason = String(f.get("reason") ?? "");
  const detail = String(f.get("detail") ?? "").trim();
  if (getShipment(no)?.courierId !== user.id) return { error: "Bu gönderi size atanmamış." };
  if (!reason) return { fieldErrors: { reason: "Bir neden seçin." } };
  if (reason === "Diğer" && detail.length < 5) return { fieldErrors: { detail: "Lütfen açıklama yazın." } };
  failDelivery(no, detail ? `${reason}: ${detail}` : reason);
  revalidatePath("/", "layout");
  redirect(`/kurye?basarisiz=${no}`);
}

/** Teslimat ve kurye puanlama (FR-18) */
export async function rateAction(_prev: FormState, f: FormData): Promise<FormState> {
  await requireRole("musteri");
  const no = String(f.get("trackingNo"));
  const delivery = Number(f.get("delivery"));
  const courier = Number(f.get("courier"));
  if (!(delivery >= 1 && delivery <= 5) || !(courier >= 1 && courier <= 5)) return { error: "Lütfen her iki puanı da 1–5 arasında seçin." };
  rateShipment(no, { delivery, courier, comment: String(f.get("comment") ?? "").trim() || undefined });
  revalidatePath("/", "layout");
  return { values: { ok: "1" } };
}
