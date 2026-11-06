"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { addAddress, removeAddress, updateUser } from "@/lib/data";
import type { FormState } from "./auth";

const PHONE_RE = /^0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

/** Profil güncelleme (FR-04) */
export async function updateProfileAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("musteri");
  const name = String(f.get("name") ?? "").trim();
  const phone = String(f.get("phone") ?? "").trim();
  const e: Record<string, string> = {};
  if (name.length < 3) e.name = "Ad soyad en az 3 karakter olmalıdır.";
  if (!PHONE_RE.test(phone)) e.phone = "Telefonu 05XX XXX XX XX biçiminde girin.";
  if (Object.keys(e).length) return { fieldErrors: e, values: { name, phone } };
  updateUser(user.id, { name, phone });
  revalidatePath("/", "layout");
  return { values: { ok: "1", name, phone } };
}

/** Adres defterine adres ekleme (FR-04) */
export async function addAddressAction(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireRole("musteri");
  const v = Object.fromEntries(["title", "name", "phone", "email", "city", "district", "address"].map((k) => [k, String(f.get(k) ?? "").trim()]));
  const e: Record<string, string> = {};
  if (!v.title) e.title = "Adres başlığı zorunludur (ör. Ev, İş).";
  if (v.name.length < 3) e.name = "Ad soyad zorunludur.";
  if (!PHONE_RE.test(v.phone)) e.phone = "Telefonu 05XX XXX XX XX biçiminde girin.";
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Geçerli bir e-posta girin.";
  if (!v.city) e.city = "Şehir seçin.";
  if (!v.district) e.district = "İlçe zorunludur.";
  if (v.address.length < 10) e.address = "Açık adresi girin.";
  if (Object.keys(e).length) return { fieldErrors: e, values: v };
  addAddress(user.id, {
    title: v.title,
    party: { name: v.name, phone: v.phone, email: v.email || undefined, city: v.city, district: v.district, address: v.address },
  });
  revalidatePath("/", "layout");
  return { values: { ok: "1" } };
}

export async function removeAddressAction(f: FormData) {
  const user = await requireRole("musteri");
  removeAddress(user.id, String(f.get("id")));
  revalidatePath("/", "layout");
}
