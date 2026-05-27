'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function toStr(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim();
  return s || null;
}

export async function createAnalysis(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title = toStr(formData.get('title'));
  if (!title) {
    redirect(`/motion?error=${encodeURIComponent('제목은 필수입니다')}`);
  }

  const reference_url = toStr(formData.get('reference_url'));
  const focus = toStr(formData.get('focus'));
  const videoPathsRaw = String(formData.get('video_paths') ?? '');
  const my_video_paths = videoPathsRaw
    ? videoPathsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  if (!reference_url && my_video_paths.length === 0) {
    redirect(`/motion?error=${encodeURIComponent('유튜브 URL 또는 내 영상 중 하나는 필요합니다')}`);
  }

  const { data: inserted } = await supabase
    .from('motion_analyses')
    .insert({
      user_id: user.id,
      title,
      reference_url,
      my_video_paths,
      focus,
      status: 'pending',
    })
    .select('id, short_id')
    .single();

  revalidatePath('/motion');
  if (inserted?.id) {
    redirect(`/motion/${inserted.id}`);
  }
  redirect('/motion');
}

export async function deleteAnalysis(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { data: row } = await supabase
    .from('motion_analyses')
    .select('my_video_paths')
    .eq('id', id)
    .single();
  if (row?.my_video_paths?.length) {
    await supabase.storage.from('session-videos').remove(row.my_video_paths);
  }
  await supabase.from('motion_analyses').delete().eq('id', id);
  revalidatePath('/motion');
  redirect('/motion');
}
