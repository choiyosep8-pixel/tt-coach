'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { SessionKind } from '@/lib/session-kinds';

const VALID_KINDS: SessionKind[] = ['lesson', 'solo', 'partner', 'game', 'tournament'];

function toNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function toStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim();
  return s || null;
}

export async function addSession(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const kind = String(formData.get('kind') ?? '') as SessionKind;
  if (!VALID_KINDS.includes(kind)) return;

  const videoPathsRaw = String(formData.get('video_paths') ?? '');
  const video_paths = videoPathsRaw
    ? videoPathsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const payload = {
    user_id: user.id,
    session_date:
      toStr(formData.get('session_date')) ?? new Date().toISOString().slice(0, 10),
    kind,
    title: toStr(formData.get('title')),
    opponent_type_id: toStr(formData.get('opponent_type_id')),
    opponent_name: toStr(formData.get('opponent_name')),
    my_score: toNum(formData.get('my_score')),
    opp_score: toNum(formData.get('opp_score')),
    worked: toStr(formData.get('worked')),
    failed: toStr(formData.get('failed')),
    video_paths,
    reference_url: toStr(formData.get('reference_url')),
    feedback: toStr(formData.get('feedback')),
    notes: toStr(formData.get('notes')),
  };

  await supabase.from('sessions').insert(payload);
  revalidatePath('/sessions');
  revalidatePath('/');
  redirect('/sessions');
}

export async function updateSessionFeedback(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const feedback = toStr(formData.get('feedback'));
  if (!id) return;
  await supabase.from('sessions').update({ feedback }).eq('id', id);
  revalidatePath('/sessions');
  revalidatePath(`/sessions/${id}`);
  revalidatePath('/calendar');
}

export async function deleteSession(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  // 영상 파일도 storage에서 정리
  const { data: row } = await supabase
    .from('sessions')
    .select('video_paths')
    .eq('id', id)
    .single();
  if (row?.video_paths?.length) {
    await supabase.storage.from('session-videos').remove(row.video_paths);
  }

  await supabase.from('sessions').delete().eq('id', id);
  revalidatePath('/sessions');
  revalidatePath('/');
}
