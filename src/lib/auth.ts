/**
 * Demo oturum yönetimi.
 * Arayüz aşamasında oturum, kullanıcı kimliğini tutan httpOnly bir çerezle sağlanır.
 * Gerçekleştirim aşamasında Auth.js + bcrypt ile değiştirilecektir (FR-01..FR-03).
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "./data";
import type { Role, User } from "./types";

export const SESSION_COOKIE = "kt_session";
export const ROLE_COOKIE = "kt_role"; // yalnızca arayüz ipucu (menüde "Panelim" bağlantısı) için

/** Demo hesapların ortak parolası */
export const DEMO_PASSWORD = "demo1234";

/** Demo amaçlı parola deposu (gerçekte veritabanında bcrypt özeti tutulur) */
const g = globalThis as unknown as { __ktPasswords?: Record<string, string> };
export const passwords: Record<string, string> = (g.__ktPasswords ??= {});

export async function getSessionUser(): Promise<User | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const user = getUser(id);
  return user && user.active ? user : null;
}

/** Korumalı sayfalarda rol kontrolü; nihai yetki kontrolü sunucu tarafında yapılır (NFR-03). */
export async function requireRole(role: Role): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/giris?yonlendir=/${role}`);
  if (user.role !== role) redirect("/yetkisiz");
  return user;
}

export async function startSession(user: User) {
  const c = await cookies();
  const opts = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8 };
  c.set(SESSION_COOKIE, user.id, opts);
  c.set(ROLE_COOKIE, user.role, { ...opts, httpOnly: false });
}

export async function endSession() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  c.delete(ROLE_COOKIE);
}
