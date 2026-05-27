'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="text-stone-500 hover:text-stone-900"
    >
      로그아웃
    </button>
  );
}
