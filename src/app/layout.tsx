import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { A11Y_INIT_SCRIPT } from "@/lib/a11y";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { default: "Yeşil Kargo · Kargo Takip Sistemi", template: "%s | Yeşil Kargo" },
  description: "Yeşil Kargo: gönderi oluşturun, kargonuzu anlık takip edin, teslimatı siz yönetin, karbon ayak izinizi azaltın.",
};

export const viewport: Viewport = {
  themeColor: "#164f36",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="a11y-init" strategy="beforeInteractive">
          {A11Y_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
