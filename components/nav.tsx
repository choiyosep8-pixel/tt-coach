import Link from 'next/link';
import { cookies } from 'next/headers';
import { SignOutButton } from './sign-out-button';

// nav는 cookie 존재 여부만 확인 (Auth 서버 호출 X)
// 진짜 user 정보는 페이지에서 fetch
export async function Nav() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore
    .getAll()
    .some(
      (c) =>
        c.name.startsWith('sb-') &&
        (c.name.endsWith('-auth-token') || c.name.endsWith('-auth-token.0'))
    );

  return (
    <header className="border-b border-[#2a2a30] bg-[#0a0a0a] sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" prefetch className="flex items-center gap-2.5 group">
          <span className="font-mono text-[15px] font-bold tracking-tight text-[#a3e635]">TT</span>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#888892] group-hover:text-stone-100 transition">
            Coach
          </span>
        </Link>
        {hasAuthCookie ? (
          <nav className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em]">
            <Link prefetch href="/" className="text-[#888892] hover:text-stone-100 transition">홈</Link>
            <Link prefetch href="/sessions" className="text-[#888892] hover:text-stone-100 transition">세션</Link>
            <Link prefetch href="/types" className="text-[#888892] hover:text-stone-100 transition">유형분석</Link>
            <Link prefetch href="/motion" className="text-[#888892] hover:text-stone-100 transition">모션분석</Link>
            <SignOutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded bg-[#a3e635] text-[#0a0a0a] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-lime-300 transition"
            >
              Enter
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
