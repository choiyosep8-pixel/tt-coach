import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KIND_BY_VALUE, type SessionKind } from '@/lib/session-kinds';
import { KIND_EMOJI } from '@/lib/session-summary';
import { deleteSession } from '../actions';
import { typeCode } from '@/lib/type-codes';
import type { Session } from '@/lib/types';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession) redirect('/login');

  const { data: s } = await supabase
    .from('sessions')
    .select(`
      id, session_date, kind, title, opponent_type_id, opponent_name,
      my_score, opp_score, worked, failed, video_paths, reference_url,
      feedback, notes, created_at,
      type:opponent_types(label,slug)
    `)
    .eq('id', id)
    .single();

  if (!s) notFound();

  const meta = KIND_BY_VALUE[s.kind as SessionKind];
  const rawType = s.type as { label: string; slug: string } | { label: string; slug: string }[] | null;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  const score =
    s.my_score != null && s.opp_score != null ? `${s.my_score} : ${s.opp_score}` : null;

  return (
    <div>
      <Link
        href="/sessions"
        prefetch
        className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-stone-100 transition"
      >
        ← 캘린더
      </Link>

      <header className="mt-4 mb-6 border-b border-[#2a2a30] pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{KIND_EMOJI[s.kind as SessionKind]}</span>
          <span
            className="font-mono text-[11px] tracking-[0.25em] font-bold"
            style={{ color: meta.color }}
          >
            {meta.code}
          </span>
          <span className="font-mono text-[12px] text-[#888892]">{s.session_date}</span>
        </div>
        {s.title && <h1 className="text-2xl font-bold mt-3 tracking-tight">{s.title}</h1>}
        {type && (
          <div className="mt-2">
            <Link
              prefetch
              href={`/types/${type.slug}`}
              className="font-mono text-[11px] tracking-[0.2em] text-[#a3e635] hover:underline"
            >
              ↗ {typeCode(type.slug)} · {type.label}
            </Link>
          </div>
        )}
      </header>

      {(s.opponent_name || score) && (
        <section className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
            Opponent
          </div>
          <div className="text-lg text-stone-100">
            {s.opponent_name ?? '익명'}{' '}
            {score && <span className="text-[#888892] font-mono ml-1">· {score}</span>}
          </div>
        </section>
      )}

      <Detail label="Win · 통한 점" value={s.worked} color="#a3e635" />
      <Detail label="Lose · 실패한 점" value={s.failed} color="#f97316" />
      <Detail label="Notes · 메모" value={s.notes} color="#888892" />
      <Detail label="Feedback · 피드백" value={s.feedback} color="#a3e635" emphasize />

      {s.reference_url && (
        <section className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
            Reference
          </div>
          <a
            href={s.reference_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#a3e635] underline underline-offset-2 break-all"
          >
            {s.reference_url}
          </a>
        </section>
      )}

      {s.video_paths && s.video_paths.length > 0 && (
        <section className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
            Videos
          </div>
          <p className="text-[12px] text-[#888892]">{s.video_paths.length}개 영상 저장됨</p>
        </section>
      )}

      <form action={deleteSession} className="mt-10">
        <input type="hidden" name="id" value={s.id} />
        <button className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-[#f97316]">
          Delete Session
        </button>
      </form>
    </div>
  );
}

function Detail({
  label,
  value,
  color,
  emphasize,
}: {
  label: string;
  value: string | null;
  color: string;
  emphasize?: boolean;
}) {
  if (!value) return null;
  return (
    <section className={`mb-4 ${emphasize ? 'border border-[#a3e635]/30 bg-[#a3e635]/[0.04] rounded-lg p-4' : ''}`}>
      <div
        className="text-[10px] uppercase tracking-[0.25em] mb-1.5 font-bold"
        style={{ color }}
      >
        {label}
      </div>
      <p className="text-[13px] text-stone-100 whitespace-pre-wrap leading-relaxed">{value}</p>
    </section>
  );
}
