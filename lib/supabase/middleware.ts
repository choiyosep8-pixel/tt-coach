import { NextResponse, type NextRequest } from 'next/server';

// 가벼운 middleware — cookie 존재 여부만 확인 (Auth 서버 호출 X)
// 진짜 사용자 검증은 페이지의 supabase.auth.getUser() + RLS가 처리
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPage = path === '/login';

  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith('sb-') &&
        (c.name.endsWith('-auth-token') || c.name.endsWith('-auth-token.0'))
    );

  if (!hasAuthCookie && !isAuthPage && !path.startsWith('/api/public')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasAuthCookie && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
