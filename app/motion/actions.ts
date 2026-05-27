'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { extractYouTubeId } from '@/lib/youtube';

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
  const my_video_url = toStr(formData.get('my_video_url'));
  const focus = toStr(formData.get('focus'));

  if (!reference_url || !my_video_url) {
    redirect(
      `/motion?error=${encodeURIComponent('롤모델 유튜브 URL과 내 유튜브 URL 모두 필요합니다')}`
    );
  }
  if (!extractYouTubeId(reference_url)) {
    redirect(`/motion?error=${encodeURIComponent('롤모델 URL이 유튜브 형식이 아닙니다')}`);
  }
  if (!extractYouTubeId(my_video_url)) {
    redirect(`/motion?error=${encodeURIComponent('내 영상 URL이 유튜브 형식이 아닙니다')}`);
  }

  const { data: inserted } = await supabase
    .from('motion_analyses')
    .insert({
      user_id: user.id,
      title,
      reference_url,
      my_video_url,
      focus,
      status: 'pending',
    })
    .select('id')
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

  await supabase.from('motion_analyses').delete().eq('id', id);
  revalidatePath('/motion');
  redirect('/motion');
}
