import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách các đường dẫn công khai không yêu cầu đăng nhập
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken'); // Lấy token từ cookie

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  
  console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'Exists' : 'Missing'}, Is Public: ${isPublicPath}`);

  // 1. Nếu chưa đăng nhập (không có token) và đang cố truy cập trang không công khai
  if (!token && !isPublicPath) {
    console.log('[Middleware] Redirecting to login (no token, accessing private path)');
    // Lưu lại URL người dùng đang cố truy cập để redirect lại sau khi đăng nhập thành công
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_uri', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Nếu đã đăng nhập (có token) và đang ở trang công khai (ví dụ: /login)
  if (token && isPublicPath) {
    console.log('[Middleware] Redirecting to home (logged in, accessing public path)');
    // Redirect về trang chủ admin
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 3. Các trường hợp khác (đã đăng nhập và vào trang private, chưa đăng nhập và vào trang public) -> cho phép truy cập
  console.log('[Middleware] Allowing request');
  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các trang cần thiết
// Loại trừ các file tĩnh (_next/static), hình ảnh (_next/image), và API routes (/api)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 