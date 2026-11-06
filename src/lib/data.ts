/**
 * Veri erişim katmanı.
 * Arayüz aşamasında veriler sunucu belleğinde tutulur (sunucu yeniden başlatılınca sıfırlanır).
 * Gerçekleştirim aşamasında bu dosyadaki fonksiyonların içi Prisma + PostgreSQL ile değiştirilecek,
 * sayfalar aynı fonksiyonları kullanmaya devam edecektir.
 */
import { ADDRESSES, BRANCHES, DELIVERY_CODES, SHIPMENTS, USERS } from "./mock-data";
import { estimateCo2, GREEN_POINTS, nextGreenDate } from "./green";
import { DEFAULT_TARIFF } from "./price";
import type { Address, Branch, DeliveryPref, Rating, Role, Shipment, ShipmentStatus, TariffRow, User } from "./types";

interface Store {
  branches: Branch[];
  users: User[];
  shipments: Shipment[];
  addresses: Record<string, Address[]>;
  codes: Record<string, string>;
  codeAttempts: Record<string, number>;
  tariff: TariffRow[];
  seq: number;
}

const g = globalThis as unknown as { __ktStore?: Store };
const store: Store = (g.__ktStore ??= {
  branches: structuredClone(BRANCHES),
  users: structuredClone(USERS),
  shipments: structuredClone(SHIPMENTS),
  addresses: structuredClone(ADDRESSES),
  codes: { ...DELIVERY_CODES },
  codeAttempts: {},
  tariff: structuredClone(DEFAULT_TARIFF),
  seq: 70,
});

export const MAX_CODE_ATTEMPTS = 3;

/* ---------------- Şubeler ---------------- */
export function listBranches(): Branch[] {
  return store.branches;
}
export function getBranch(id: string): Branch | undefined {
  return store.branches.find((b) => b.id === id);
}
export function addBranch(b: Omit<Branch, "id">): Branch {
  const branch = { ...b, id: `b-${Date.now()}` };
  store.branches.push(branch);
  return branch;
}

/* ---------------- Kullanıcılar ---------------- */
export function listUsers(role?: Role): User[] {
  return role ? store.users.filter((u) => u.role === role) : store.users;
}
export function getUser(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}
export function findUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
export function addUser(u: Omit<User, "id" | "active">): User {
  const user: User = { ...u, id: `u-${Date.now()}`, active: true };
  store.users.push(user);
  return user;
}
export function toggleUser(id: string) {
  const u = getUser(id);
  if (u) u.active = !u.active;
}
export function updateUser(id: string, patch: Partial<Pick<User, "name" | "phone">>) {
  const u = getUser(id);
  if (u) Object.assign(u, patch);
}

/* ---------------- Adres defteri ---------------- */
export function listAddresses(userId: string): Address[] {
  return store.addresses[userId] ?? [];
}
export function addAddress(userId: string, a: Omit<Address, "id">) {
  (store.addresses[userId] ??= []).push({ ...a, id: `a-${Date.now()}` });
}
export function removeAddress(userId: string, id: string) {
  store.addresses[userId] = listAddresses(userId).filter((a) => a.id !== id);
}

/* ---------------- Tarife ---------------- */
export function getTariff(): TariffRow[] {
  return store.tariff;
}
export function updateTariff(prices: Record<string, number>) {
  for (const row of store.tariff) if (prices[row.id] !== undefined) row.price = prices[row.id];
}

/* ---------------- Gönderiler ---------------- */
export function listShipments(): Shipment[] {
  return [...store.shipments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getShipment(trackingNo: string): Shipment | undefined {
  return store.shipments.find((s) => s.trackingNo === trackingNo);
}

/** Gönderinin en son bulunduğu şube */
export function currentBranchId(s: Shipment): string {
  return [...s.history].reverse().find((e) => e.branchId)?.branchId ?? s.originBranchId;
}

/** "Kargolarım": müşterinin gönderdiği ve kendisine gelen gönderiler (FR-11) */
export function listCustomerShipments(user: User) {
  const all = listShipments();
  return {
    sent: all.filter((s) => s.customerId === user.id),
    incoming: all.filter((s) => s.receiver.email?.toLowerCase() === user.email.toLowerCase()),
  };
}

/** Şubede bulunan veya şubeye gelecek gönderiler */
export function listBranchShipments(branchId: string) {
  const all = listShipments();
  const arrived = (s: Shipment) => s.destBranchId === branchId && (s.status === "VARIS_SUBESINDE" || s.status === "TESLIM_EDILEMEDI");
  const pickup = (s: Shipment) => arrived(s) && s.deliveryPref?.option === "SUBEDEN";
  return {
    here: all.filter((s) => currentBranchId(s) === branchId && !arrived(s) && !["TESLIM_EDILDI", "DAGITIMDA", "IADE"].includes(s.status)),
    awaitingAssign: all.filter((s) => arrived(s) && !pickup(s)),
    /** Alıcının şubeden teslim almayı seçtiği gönderiler (kuryeye atanmaz) */
    awaitingPickup: all.filter(pickup),
    outForDelivery: all.filter((s) => s.destBranchId === branchId && s.status === "DAGITIMDA"),
  };
}

export function listCourierShipments(courierId: string) {
  return listShipments().filter((s) => s.courierId === courierId && ["DAGITIMDA", "TESLIM_EDILEMEDI", "TESLIM_EDILDI"].includes(s.status));
}

function nextTrackingNo(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  store.seq += 1;
  return `KT${ymd}${String(store.seq % 100).padStart(2, "0")}`;
}

export function createShipment(input: Omit<Shipment, "trackingNo" | "status" | "history" | "createdAt" | "estimatedDelivery">): Shipment {
  const now = new Date();
  const eta = new Date(now.getTime() + 3 * 86400000);
  let trackingNo = nextTrackingNo();
  while (getShipment(trackingNo)) trackingNo = nextTrackingNo();
  const s: Shipment = {
    ...input,
    trackingNo,
    status: "OLUSTURULDU",
    createdAt: now.toISOString(),
    estimatedDelivery: eta.toISOString().slice(0, 10),
    history: [{ status: "OLUSTURULDU", date: now.toISOString(), note: "Gönderi oluşturuldu." }],
  };
  store.shipments.push(s);
  return s;
}

/** QR okutma sonrası durum güncelleme (FR-12). Alıcıya e-posta bildirimi tetiklenir (FR-17). */
export function updateStatus(trackingNo: string, status: ShipmentStatus, branchId?: string, note?: string) {
  const s = getShipment(trackingNo);
  if (!s) throw new Error("Gönderi bulunamadı");
  s.status = status;
  s.history.push({ status, date: new Date().toISOString(), branchId, note });
  sendNotification(s);
  return s;
}

/** Kuryeye atama (FR-13): durum Dağıtımda olur, alıcıya 6 haneli doğrulama kodu gönderilir (FR-14). */
export function assignCourier(trackingNos: string[], courierId: string) {
  const courier = getUser(courierId);
  for (const no of trackingNos) {
    const s = getShipment(no);
    if (!s) continue;
    s.courierId = courierId;
    store.codes[no] = newCode();
    store.codeAttempts[no] = 0;
    updateStatus(no, "DAGITIMDA", s.destBranchId, courier ? `Kurye: ${courier.name}` : undefined);
  }
}

export type DeliveryResult = { ok: true } | { ok: false; error: string; attemptsLeft: number };

const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

/** Şubeden teslim alınabilir mi? (alıcı "şubeden alacağım" dedi ve kargo varış şubesinde) */
export const isPickupReady = (s: Shipment) => s.deliveryPref?.option === "SUBEDEN" && (s.status === "VARIS_SUBESINDE" || s.status === "TESLIM_EDILEMEDI");

/**
 * Doğrulama kodlu teslimat (FR-15).
 * Kurye adreste ("Dağıtımda" gönderi) veya şube personeli şubede ("şubeden alacağım" tercihi) teslim eder.
 */
export function completeDelivery(trackingNo: string, code: string, at: "adres" | "sube" = "adres"): DeliveryResult {
  const s = getShipment(trackingNo);
  if (!s) return { ok: false, error: "Gönderi bulunamadı.", attemptsLeft: 0 };
  if (at === "adres" && s.status !== "DAGITIMDA") return { ok: false, error: "Gönderi dağıtımda değil.", attemptsLeft: 0 };
  if (at === "sube" && !isPickupReady(s)) return { ok: false, error: "Bu gönderi şubeden teslim için hazır değil.", attemptsLeft: 0 };
  const attempts = store.codeAttempts[trackingNo] ?? 0;
  if (attempts >= MAX_CODE_ATTEMPTS) {
    return { ok: false, error: "Deneme hakkı doldu. Gönderiyi 'Teslim Edilemedi' olarak işaretleyin.", attemptsLeft: 0 };
  }
  if (store.codes[trackingNo] !== code) {
    store.codeAttempts[trackingNo] = attempts + 1;
    const left = MAX_CODE_ATTEMPTS - attempts - 1;
    return { ok: false, error: `Doğrulama kodu hatalı. Kalan deneme: ${left}`, attemptsLeft: left };
  }
  awardGreenPoints(s);
  const note = at === "sube" ? "Alıcı şubeden doğrulama kodu ile teslim aldı." : s.deliveryPref?.option === "KOMSU" ? `Doğrulama kodu ile komşuya teslim edildi (${s.deliveryPref.neighbor}).` : "Doğrulama kodu ile teslim edildi.";
  updateStatus(trackingNo, "TESLIM_EDILDI", s.destBranchId, note);
  delete store.codes[trackingNo];
  return { ok: true };
}

/* ---------------- Alıcı kontrolü ve Yeşil Kargo ---------------- */

/**
 * Alıcının teslimat tercihini kaydeder ("Kargom yolda, planım değişti").
 * Yeşil gün seçilirse tarih varış şubesinin toplu dağıtım gününe göre belirlenir;
 * "şubeden alacağım" seçilirse doğrulama kodu hemen üretilip alıcıya gönderilir.
 */
export function setDeliveryPref(trackingNo: string, pref: Omit<DeliveryPref, "updatedAt">) {
  const s = getShipment(trackingNo);
  if (!s) return;
  const p: DeliveryPref = { ...pref, updatedAt: new Date().toISOString() };
  if (p.option === "YESIL_GUN") p.date = nextGreenDate(getBranch(s.destBranchId)!);
  if (p.date) s.estimatedDelivery = p.date;
  if (p.option === "SUBEDEN") {
    store.codes[trackingNo] ??= newCode();
    store.codeAttempts[trackingNo] = 0;
  } else if (s.deliveryPref?.option === "SUBEDEN") {
    delete store.codes[trackingNo]; // kod kurye atamasında yeniden üretilir
  }
  s.deliveryPref = p.option === "ADRES" ? undefined : p;
  if (s.receiver.email) outbox.unshift({ to: s.receiver.email, subject: `${s.trackingNo} için teslimat tercihiniz kaydedildi`, date: p.updatedAt });
}

/** Gönderinin tahmini karbon ayak izi (alıcının tercihine göre) */
export function shipmentCo2(s: Shipment) {
  return estimateCo2(getBranch(s.originBranchId)!, getBranch(s.destBranchId)!, s.pkg.weightKg, s.pkg.desi, s.deliveryPref?.option);
}

/** Teslimatta yeşil tercih yapan üye alıcıya puan verir */
function awardGreenPoints(s: Shipment) {
  const pts = GREEN_POINTS[s.deliveryPref?.option ?? "ADRES"];
  const user = s.receiver.email ? findUserByEmail(s.receiver.email) : undefined;
  if (!pts || !user || user.role !== "musteri") return;
  user.greenPoints = (user.greenPoints ?? 0) + pts;
  s.greenAwarded = pts;
}

export function spendGreenPoints(userId: string, points: number) {
  const u = getUser(userId);
  if (u) u.greenPoints = Math.max(0, (u.greenPoints ?? 0) - points);
}

/** Yönetici paneli için Yeşil Kargo özeti (sistemdeki gerçek gönderilerden) */
export function greenStats() {
  const all = store.shipments;
  const green = all.filter((s) => s.deliveryPref && (s.deliveryPref.option === "SUBEDEN" || s.deliveryPref.option === "YESIL_GUN"));
  return {
    total: all.reduce((t, s) => t + shipmentCo2(s).total, 0),
    saved: green.reduce((t, s) => t + shipmentCo2(s).saved, 0),
    greenCount: green.length,
    prefCount: all.filter((s) => s.deliveryPref).length,
    ratio: all.length ? green.length / all.length : 0,
    pointsAwarded: all.reduce((t, s) => t + (s.greenAwarded ?? 0), 0),
  };
}

/** Teslim edilemedi kaydı (FR-16) */
export function failDelivery(trackingNo: string, reason: string) {
  const s = getShipment(trackingNo);
  if (!s) return;
  updateStatus(trackingNo, "TESLIM_EDILEMEDI", s.destBranchId, reason);
}

/** Teslimat ve kurye puanlama (FR-18) */
export function rateShipment(trackingNo: string, rating: Rating) {
  const s = getShipment(trackingNo);
  if (s && s.status === "TESLIM_EDILDI") s.rating = rating;
}

/** Demo amaçlı: arayüzde doğrulama kodunu göstermek için (gerçekte yalnızca alıcının e-postasına gider) */
export function demoDeliveryCode(trackingNo: string): string | undefined {
  return store.codes[trackingNo];
}

/* ---------------- Bildirim (FR-17) ---------------- */
export interface SentMail {
  to: string;
  subject: string;
  date: string;
}
const outbox: SentMail[] = ((globalThis as unknown as { __ktOutbox?: SentMail[] }).__ktOutbox ??= []);

function sendNotification(s: Shipment) {
  if (!s.receiver.email) return;
  // Gerçekleştirim aşamasında Resend ile gönderilecek; şimdilik giden kutusuna kaydedilir.
  outbox.unshift({ to: s.receiver.email, subject: `${s.trackingNo} numaralı gönderinizin durumu güncellendi`, date: new Date().toISOString() });
}
export function listOutbox(): SentMail[] {
  return outbox.slice(0, 20);
}

/* ---------------- İstatistik ---------------- */
export function statusCounts(): Record<ShipmentStatus, number> {
  const c = {} as Record<ShipmentStatus, number>;
  for (const s of store.shipments) c[s.status] = (c[s.status] ?? 0) + 1;
  return c;
}

export function courierPerformance() {
  return listUsers("kurye").map((k) => {
    const mine = store.shipments.filter((s) => s.courierId === k.id);
    const rated = mine.filter((s) => s.rating);
    const avg = rated.length ? rated.reduce((t, s) => t + s.rating!.courier, 0) / rated.length : null;
    return {
      courier: k,
      delivered: mine.filter((s) => s.status === "TESLIM_EDILDI").length,
      failed: mine.filter((s) => s.status === "TESLIM_EDILEMEDI").length,
      active: mine.filter((s) => s.status === "DAGITIMDA").length,
      avgRating: avg,
    };
  });
}
