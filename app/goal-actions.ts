'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function toStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim();
  return s || null;
}

export async function saveMonthlyGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const year_month = String(formData.get('year_month') ?? '');
  if (!/^\d{4}-\d{2}$/.test(year_month)) return;

  await supabase.from('monthly_goals').upsert(
    {
      user_id: user.id,
      year_month,
      goal: toStr(formData.get('goal')),
      focus_1: toStr(formData.get('focus_1')),
      focus_2: toStr(formData.get('focus_2')),
      focus_3: toStr(formData.get('focus_3')),
    },
    { onConflict: 'user_id,year_month' }
  );

  revalidatePath('/');
  revalidatePath('/sessions');
}

export async function savePlayerProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await supabase.from('player_profile').upsert(
    {
      user_id: user.id,
      strengths: toStr(formData.get('strengths')),
      weaknesses: toStr(formData.get('weaknesses')),
      injuries: toStr(formData.get('injuries')),
      coach_direction: toStr(formData.get('coach_direction')),
      long_term_goal: toStr(formData.get('long_term_goal')),
    },
    { onConflict: 'user_id' }
  );

  revalidatePath('/');
  revalidatePath('/sessions');
}
