import { NextResponse, type NextRequest } from "next/server";

/**
 * İyimser (optimistic) yönlendirme: oturum çerezi olmayan kullanıcıyı korumalı
 * panellerden giriş sayfasına, farklı rolle gelen kullanıcıyı yetkisiz sayfasına yönlendirir.
 * Nihai yetki kontrolü panel düzenlerinde sunucu tarafında (requireRole) yapılır.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const area = pathname.split("/")[1]; // musteri | sube | kurye | yonetici
  const session = request.cookies.get("kt_session")?.value;
  const role = request.cookies.get("kt_role")?.value;

  if (!session) {
    const url = new URL("/giris", request.url);
    url.searchParams.set("yonlendir", pathname);
    return NextResponse.redirect(url);
  }
  if (role && role !== area) {
    return NextResponse.redirect(new URL("/yetkisiz", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/musteri/:path*", "/sube/:path*", "/kurye/:path*", "/yonetici/:path*"],
};
