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
    <button onClick={signOut} className="text-[14px] text-[#5a5a62] hover:text-stone-100 transition py-1">
      나가기
    </button>
  );
}
