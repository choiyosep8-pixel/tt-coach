'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('82') && digits.length >= 12) return '0' + digits.slice(2);
  if (/^01\d{8,9}$/.test(digits)) return digits;
  return null;
}

export async function enter(formData: FormData) {
  const raw = String(formData.get('phone') ?? '');
  const phone = normalizePhone(raw);
  if (!phone) {
    redirect(`/login?error=${encodeURIComponent('올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)')}`);
  }
  const email = `${phone}@phone.tt-coach.local`;
  const password = `tt-${phone}-key`;

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: phone, phone } },
    });
    if (signUpError) {
      redirect(`/login?error=${encodeURIComponent(signUpError.message)}`);
    }
    const { error: postSignInError } = await supabase.auth.signInWithPassword({ email, password });
    if (postSignInError) {
      redirect(`/login?error=${encodeURIComponent('가입은 됐지만 자동 로그인 실패: ' + postSignInError.message + ' — 같은 번호로 다시 한 번 눌러주세요')}`);
    }
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
