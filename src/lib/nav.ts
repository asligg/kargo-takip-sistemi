import type { Role } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide ikon adı (panel-shell içinde eşlenir)
}

export const ROLE_LABEL: Record<Role, string> = {
  musteri: "Müşteri",
  sube: "Şube Personeli",
  kurye: "Kurye",
  yonetici: "Yönetici",
};

/** Her rolün giriş sonrası yönlendirileceği ana sayfa */
export const ROLE_HOME: Record<Role, string> = {
  musteri: "/musteri",
  sube: "/sube",
  kurye: "/kurye",
  yonetici: "/yonetici",
};

/** Rol bazlı menüler (yetkilendirme matrisine göre) */
export const ROLE_NAV: Record<Role, NavItem[]> = {
  musteri: [
    { href: "/musteri", label: "Kargolarım", icon: "package" },
    { href: "/musteri/gonderi-olustur", label: "Gönderi Oluştur", icon: "plus" },
    { href: "/musteri/adresler", label: "Adres Defterim", icon: "book" },
    { href: "/musteri/profil", label: "Profilim", icon: "user" },
  ],
  sube: [
    { href: "/sube", label: "Şube Paneli", icon: "home" },
    { href: "/sube/qr-okut", label: "QR Okut / Durum Güncelle", icon: "scan" },
    { href: "/sube/kurye-atama", label: "Kuryeye Gönderi Ata", icon: "truck" },
    { href: "/sube/gonderi-olustur", label: "Gönderi Kabul", icon: "plus" },
  ],
  kurye: [
    { href: "/kurye", label: "Atanan Gönderiler", icon: "list" },
    { href: "/kurye/qr-okut", label: "QR Okut", icon: "scan" },
  ],
  yonetici: [
    { href: "/yonetici", label: "Dashboard", icon: "chart" },
    { href: "/yonetici/subeler", label: "Şubeler", icon: "building" },
    { href: "/yonetici/personel", label: "Personel ve Kuryeler", icon: "users" },
    { href: "/yonetici/gonderiler", label: "Tüm Gönderiler", icon: "package" },
    { href: "/yonetici/tarife", label: "Ücret Tarifesi", icon: "tag" },
    { href: "/yonetici/raporlar", label: "Raporlar", icon: "report" },
  ],
};

/** Korumalı alanlar ve erişebilecek roller */
export const PROTECTED_PREFIX: Record<string, Role> = {
  "/musteri": "musteri",
  "/sube": "sube",
  "/kurye": "kurye",
  "/yonetici": "yonetici",
};
