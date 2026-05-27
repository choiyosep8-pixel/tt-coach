import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MotionStatusBadge } from '@/components/motion-status-badge';
import { deleteAnalysis } from '../actions';
import { CopyCommand } from './copy-command';
import { youtubeEmbedUrl } from '@/lib/youtube';
import { formatSec } from '@/lib/time';
import type { MotionAnalysis } from '@/lib/types';

const POSITION_LABEL: Record<string, string> = {
  solo: '단독',
  left: '왼쪽',
  right: '오른쪽',
  near: '카메라 쪽',
  far: '반대편',
};
const HAND_LABEL: Record<string, string> = {
  right: '오른손',
  left: '왼손',
};

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

  const refEmbed = youtubeEmbedUrl(a.reference_url);
  const mineEmbed = youtubeEmbedUrl(a.my_video_url);
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

      {a.status === 'pending' && (
        <section className="mb-6 border border-[#a3e635]/40 bg-[#a3e635]/[0.04] rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] mb-2">
            CLI에서 실행하기
          </div>
          <CopyCommand command={command} />
          <p className="text-[11px] text-[#888892] mt-3 leading-relaxed">
            클로드 코드 채팅에 위 명령을 붙여넣으면 두 유튜브 영상을 받아와 키프레임을 비교하고
            결과를 여기로 박아드립니다.
          </p>
        </section>
      )}

      {/* 영상 비교 — 임베드 2장 */}
      <section className="grid sm:grid-cols-2 gap-3 mb-6">
        <VideoBlock
          label="Reference"
          subject={a.reference_subject}
          position={a.reference_position}
          hand={a.reference_hand}
          startSec={a.reference_start_sec}
          endSec={a.reference_end_sec}
          url={a.reference_url}
          embed={refEmbed}
          accent="#888892"
        />
        <VideoBlock
          label="Mine"
          subject={a.my_subject}
          position={a.my_position}
          hand={a.my_hand}
          startSec={a.my_start_sec}
          endSec={a.my_end_sec}
          url={a.my_video_url}
          embed={mineEmbed}
          accent="#a3e635"
        />
      </section>

      {a.focus && (
        <section className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
            Focus
          </div>
          <p className="text-[13px] text-stone-100 whitespace-pre-wrap leading-relaxed">
            {a.focus}
          </p>
        </section>
      )}

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

function VideoBlock({
  label,
  subject,
  position,
  hand,
  startSec,
  endSec,
  url,
  embed,
  accent,
}: {
  label: string;
  subject?: string | null;
  position?: string | null;
  hand?: string | null;
  startSec?: number | null;
  endSec?: number | null;
  url: string | null;
  embed: string | null;
  accent: string;
}) {
  const meta = [
    position ? POSITION_LABEL[position] ?? position : null,
    hand ? HAND_LABEL[hand] ?? hand : null,
  ].filter(Boolean);
  const range =
    startSec != null || endSec != null
      ? `${formatSec(startSec) || '0:00'} → ${formatSec(endSec) || 'end'}`
      : null;
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-[0.25em] mb-1 font-bold"
        style={{ color: accent }}
      >
        {label}
      </div>
      {(meta.length > 0 || subject || range) && (
        <div className="mb-2 text-[11px] text-stone-100 space-y-0.5">
          {meta.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {meta.map((m) => (
                <span
                  key={m}
                  className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-[0.15em] font-semibold"
                  style={{ color: accent, backgroundColor: `${accent}20` }}
                >
                  {m}
                </span>
              ))}
            </div>
          )}
          {subject && (
            <div className="text-[11px] text-stone-100 leading-snug">
              <span className="text-[#5a5a62]">→ </span>
              {subject}
            </div>
          )}
          {range && (
            <div className="font-mono text-[11px] text-[#888892]">⏱ {range}</div>
          )}
        </div>
      )}
      {embed ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-[#2a2a30]">
          <iframe
            src={embed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[12px] text-[#a3e635] underline underline-offset-2 break-all"
        >
          {url}
        </a>
      ) : (
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62]">No URL</div>
      )}
    </div>
  );
}
