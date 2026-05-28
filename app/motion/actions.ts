'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { extractYouTubeId } from '@/lib/youtube';
import { parseTimeToSec } from '@/lib/time';

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

  const analysisMode = String(formData.get('analysis_mode') ?? 'vs_reference');
  const isVsRef = analysisMode === 'vs_reference';

  // Reference 또는 Criteria
  let reference_url: string | null = null;
  let criteria: string | null = null;

  if (isVsRef) {
    reference_url = toStr(formData.get('reference_url'));
    if (!reference_url || !extractYouTubeId(reference_url)) {
      redirect(`/motion?error=${encodeURIComponent('Reference 유튜브 URL이 필요합니다')}`);
    }
  } else {
    criteria = toStr(formData.get('criteria'));
    if (!criteria) {
      redirect(`/motion?error=${encodeURIComponent('코치 요구사항을 입력해주세요')}`);
    }
  }

  // Mine 모드 분기
  const mineMode = String(formData.get('my_mode') ?? 'upload');
  let my_video_url: string | null = null;
  let my_video_paths: string[] = [];

  if (mineMode === 'youtube') {
    my_video_url = toStr(formData.get('my_video_url'));
    if (!my_video_url) {
      redirect(`/motion?error=${encodeURIComponent('내 유튜브 URL 또는 파일이 필요합니다')}`);
    }
    if (!extractYouTubeId(my_video_url)) {
      redirect(`/motion?error=${encodeURIComponent('내 유튜브 URL 형식이 아닙니다')}`);
    }
  } else {
    const videoPathsRaw = String(formData.get('video_paths') ?? '');
    my_video_paths = videoPathsRaw
      ? videoPathsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (my_video_paths.length === 0) {
      redirect(`/motion?error=${encodeURIComponent('내 영상 파일을 업로드하세요')}`);
    }
  }

  const { data: inserted } = await supabase
    .from('motion_analyses')
    .insert({
      user_id: user.id,
      title,
      analysis_mode: analysisMode,
      criteria,
      reference_url,
      reference_subject: isVsRef ? toStr(formData.get('reference_subject')) : null,
      reference_position: isVsRef ? toStr(formData.get('reference_position')) : null,
      reference_hand: isVsRef ? toStr(formData.get('reference_hand')) : null,
      reference_start_sec: isVsRef ? parseTimeToSec(String(formData.get('reference_start') ?? '')) : null,
      reference_end_sec: isVsRef ? parseTimeToSec(String(formData.get('reference_end') ?? '')) : null,
      my_video_url,
      my_video_paths,
      my_subject: toStr(formData.get('my_subject')),
      my_position: toStr(formData.get('my_position')),
      my_hand: toStr(formData.get('my_hand')),
      my_start_sec: parseTimeToSec(String(formData.get('my_start') ?? '')),
      my_end_sec: parseTimeToSec(String(formData.get('my_end') ?? '')),
      focus: toStr(formData.get('focus')),
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
