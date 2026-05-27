import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from './sign-out-button';

export async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          🏓 TT Coach
        </Link>
        {user ? (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-stone-600 hover:text-stone-900">유형</Link>
            <Link href="/matches" className="text-stone-600 hover:text-stone-900">기록</Link>
            <SignOutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-stone-600 hover:text-stone-900">로그인</Link>
            <Link
              href="/signup"
              className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              회원가입
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
