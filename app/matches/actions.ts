'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function addMatch(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const toNum = (v: FormDataEntryValue | null) => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const payload = {
    user_id: user.id,
    played_at: String(formData.get('played_at') ?? new Date().toISOString().slice(0, 10)),
    opponent_name: String(formData.get('opponent_name') ?? '').trim() || null,
    type_id: String(formData.get('type_id') ?? '') || null,
    my_score: toNum(formData.get('my_score')),
    opp_score: toNum(formData.get('opp_score')),
    worked: String(formData.get('worked') ?? '').trim() || null,
    failed: String(formData.get('failed') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  };

  await supabase.from('matches').insert(payload);
  revalidatePath('/matches');
  revalidatePath('/');
}

export async function deleteMatch(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await supabase.from('matches').delete().eq('id', id);
  revalidatePath('/matches');
}
