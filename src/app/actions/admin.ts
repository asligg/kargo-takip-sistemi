"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { addBranch, addUser, findUserByEmail, getBranch, getTariff, toggleUser, updateTariff } from "@/lib/data";
import type { BranchType, Role } from "@/lib/types";
import type { FormState } from "./auth";

export async function addBranchAction(_prev: FormState, f: FormData): Promise<FormState> {
  await requireRole("yonetici");
  const v = {
    name: String(f.get("name") ?? "").trim(),
    city: String(f.get("city") ?? "").trim(),
    type: (f.get("type") === "transfer" ? "transfer" : "sube") as BranchType,
    address: String(f.get("address") ?? "").trim(),
    phone: String(f.get("phone") ?? "").trim(),
    lat: Number(f.get("lat")),
    lng: Number(f.get("lng")),
  };
  const e: Record<string, string> = {};
  if (v.name.length < 3) e.name = "Şube adı zorunludur.";
  if (!v.city) e.city = "Şehir zorunludur.";
  if (v.address.length < 10) e.address = "Adres zorunludur.";
  if (!v.phone) e.phone = "Telefon zorunludur.";
  if (!(v.lat >= 35 && v.lat <= 43)) e.lat = "Enlem 35–43 arasında olmalıdır.";
  if (!(v.lng >= 25 && v.lng <= 45)) e.lng = "Boylam 25–45 arasında olmalıdır.";
  if (Object.keys(e).length) return { fieldErrors: e, values: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)])) };
  addBranch(v);
  revalidatePath("/", "layout");
  return { values: { ok: "1" } };
}

/** Şube personeli ve kurye hesapları yalnızca yönetici tarafından oluşturulur */
export async function addStaffAction(_prev: FormState, f: FormData): Promise<FormState> {
  await requireRole("yonetici");
  const v = {
    name: String(f.get("name") ?? "").trim(),
    email: String(f.get("email") ?? "").trim(),
    phone: String(f.get("phone") ?? "").trim(),
    role: (f.get("role") === "kurye" ? "kurye" : "sube") as Role,
    branchId: String(f.get("branchId") ?? ""),
  };
  const e: Record<string, string> = {};
  if (v.name.length < 3) e.name = "Ad soyad zorunludur.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Geçerli bir e-posta girin.";
  else if (findUserByEmail(v.email)) e.email = "Bu e-posta zaten kayıtlı.";
  if (!v.phone) e.phone = "Telefon zorunludur.";
  if (!getBranch(v.branchId)) e.branchId = "Şube seçin.";
  if (Object.keys(e).length) return { fieldErrors: e, values: v };
  addUser(v);
  revalidatePath("/", "layout");
  return { values: { ok: "1" } };
}

export async function toggleUserAction(f: FormData) {
  await requireRole("yonetici");
  toggleUser(String(f.get("id")));
  revalidatePath("/", "layout");
}

export async function updateTariffAction(_prev: FormState, f: FormData): Promise<FormState> {
  await requireRole("yonetici");
  const prices: Record<string, number> = {};
  const e: Record<string, string> = {};
  for (const row of getTariff()) {
    const n = Number(f.get(row.id));
    if (!(n > 0) || n > 100000) e[row.id] = "Geçerli bir tutar girin.";
    else prices[row.id] = Math.round(n * 100) / 100;
  }
  if (Object.keys(e).length) return { fieldErrors: e };
  updateTariff(prices);
  revalidatePath("/", "layout");
  return { values: { ok: "1" } };
}
