'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('display_name') ?? '').trim();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || email.split('@')[0] } },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }
  // Email confirmation 꺼져있으면 바로 로그인됨
  revalidatePath('/', 'layout');
  redirect('/');
}
