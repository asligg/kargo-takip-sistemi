"use server";

import { redirect } from "next/navigation";
import { DEMO_PASSWORD, endSession, passwords, startSession } from "@/lib/auth";
import { addUser, findUserByEmail } from "@/lib/data";
import { ROLE_HOME } from "@/lib/nav";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("yonlendir") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Geçerli bir e-posta adresi girin.";
  if (!password) fieldErrors.password = "Parola zorunludur.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { email } };

  const user = findUserByEmail(email);
  const expected = user ? (passwords[user.id] ?? DEMO_PASSWORD) : null;
  if (!user || expected !== password) return { error: "E-posta veya parola hatalı.", values: { email } };
  if (!user.active) return { error: "Hesabınız pasif durumdadır. Lütfen yöneticiyle iletişime geçin.", values: { email } };

  await startSession(user);
  const home = ROLE_HOME[user.role];
  redirect(next.startsWith(home) ? next : home);
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (values.name.length < 3) fieldErrors.name = "Ad soyad en az 3 karakter olmalıdır.";
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "Geçerli bir e-posta adresi girin.";
  else if (findUserByEmail(values.email)) fieldErrors.email = "Bu e-posta adresiyle kayıtlı bir hesap var.";
  if (!/^0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(values.phone)) fieldErrors.phone = "Telefonu 05XX XXX XX XX biçiminde girin.";
  if (password.length < 8) fieldErrors.password = "Parola en az 8 karakter olmalıdır.";
  else if (password !== password2) fieldErrors.password2 = "Parolalar eşleşmiyor.";
  if (formData.get("kvkk") !== "on") fieldErrors.kvkk = "Devam etmek için aydınlatma metnini onaylamalısınız.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const user = addUser({ ...values, role: "musteri" });
  passwords[user.id] = password;
  await startSession(user);
  redirect(ROLE_HOME.musteri);
}

export async function logoutAction() {
  await endSession();
  redirect("/giris");
}
