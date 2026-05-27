import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MotionStatusBadge } from '@/components/motion-status-badge';
import { deleteAnalysis } from '../actions';
import { CopyCommand } from './copy-command';
import type { MotionAnalysis } from '@/lib/types';

export default async function MotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: a } = await supabase
    .from('motion_analyses')
    .select('*')
    .eq('id', id)
    .single<MotionAnalysis>();

  if (!a) notFound();

  // 영상 signed URL (1시간)
  const signedUrls: string[] = [];
  if (a.my_video_paths?.length) {
    const { data: signed } = await supabase
      .storage
      .from('session-videos')
      .createSignedUrls(a.my_video_paths, 3600);
    (signed ?? []).forEach((s) => {
      if (s.signedUrl) signedUrls.push(s.signedUrl);
    });
  }

  const command = `motion ${a.short_id}`;

  return (
    <div>
      <Link
        href="/motion"
        className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-stone-100 transition"
      >
        ← Analyses
      </Link>

      <header className="mt-4 mb-6 border-b border-[#2a2a30] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.25em] text-[#5a5a62]">
            #{a.short_id}
          </span>
          <MotionStatusBadge status={a.status} />
        </div>
        <h1 className="text-2xl font-bold mt-3 tracking-tight">{a.title}</h1>
        <div className="font-mono text-[11px] text-[#888892] mt-2">
          {a.created_at.slice(0, 16).replace('T', ' ')}
        </div>
      </header>

      {/* 사용자에게 채팅 명령 안내 */}
      {a.status === 'pending' && (
        <section className="mb-6 border border-[#a3e635]/40 bg-[#a3e635]/[0.04] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] mb-2">
            다음 액션 — 클로드 채팅에 붙여넣기
          </div>
          <CopyCommand command={command} />
          <p className="text-[11px] text-[#888892] mt-3 leading-relaxed">
            클로드가 yt-dlp + ffmpeg로 두 영상 키프레임 추출 후 비교 분석합니다.
            결과가 박히면 이 페이지에 자동 노출됩니다.
          </p>
        </section>
      )}

      {/* 입력 정보 */}
      <section className="space-y-3 mb-6">
        {a.reference_url && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
              Reference URL
            </div>
            <a
              href={a.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#a3e635] underline underline-offset-2 break-all"
            >
              {a.reference_url}
            </a>
          </div>
        )}

        {signedUrls.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-2">
              My Video × {signedUrls.length}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {signedUrls.map((url, i) => (
                <video
                  key={i}
                  src={url}
                  controls
                  preload="metadata"
                  className="w-full rounded border border-[#2a2a30] bg-black"
                />
              ))}
            </div>
          </div>
        )}

        {a.focus && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
              Focus
            </div>
            <p className="text-[13px] text-stone-100 whitespace-pre-wrap leading-relaxed">
              {a.focus}
            </p>
          </div>
        )}
      </section>

      {/* 결과 */}
      {a.feedback && (
        <section className="border border-[#a3e635]/30 bg-[#a3e635]/[0.04] rounded-lg p-5 mb-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] mb-3">
            Feedback
          </div>
          <div className="text-[14px] text-stone-100 whitespace-pre-wrap leading-relaxed">
            {a.feedback}
          </div>
        </section>
      )}

      {a.error && (
        <section className="border border-[#f97316]/30 bg-[#f97316]/[0.06] rounded-lg p-4 mb-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#f97316] mb-2">Error</div>
          <p className="text-[13px] text-stone-100 whitespace-pre-wrap">{a.error}</p>
        </section>
      )}

      <form action={deleteAnalysis} className="mt-8">
        <input type="hidden" name="id" value={a.id} />
        <button className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-[#f97316]">
          Delete Analysis
        </button>
      </form>
    </div>
  );
}
