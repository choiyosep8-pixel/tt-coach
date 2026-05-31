import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MotionForm } from '@/components/motion-form';
import { MotionStatusBadge } from '@/components/motion-status-badge';
import type { MotionAnalysis, FeedbackData } from '@/lib/types';

export default async function MotionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const userId = user.id;

  const { data: analyses } = await supabase
    .from('motion_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <header className="mb-5">
        <div className="text-[13px] text-[#5a5a62]">모션 분석</div>
        <h1 className="text-[24px] font-bold mt-1 tracking-tight">
          <span className="text-[#a3e635]">영상</span>으로 자세 점검
        </h1>
      </header>

      {error && (
        <div className="mb-4 text-[14px] text-[#f97316] border border-[#f97316]/30 bg-[#f97316]/10 rounded px-3 py-2.5">
          {error}
        </div>
      )}

      {/* 1) 최근 피드백 — 최상단 */}
      <section className="mb-8">
        <h2 className="text-[14px] text-[#a3e635] mb-3 font-bold">
          ▸ 최근 피드백 · {analyses?.length ?? 0}건
        </h2>
        <ul className="space-y-2.5">
          {((analyses ?? []) as MotionAnalysis[]).map((a) => {
            const fd = a.feedback_data as FeedbackData | null;
            const score = fd?.overall_score;
            return (
              <li key={a.id}>
                <Link
                  href={`/motion/${a.id}`}
                  className="block bg-[#14141a] border border-[#2a2a30] rounded-lg p-4 hover:border-[#a3e635]/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="font-mono text-[#5a5a62]">#{a.short_id}</span>
                        <span className="text-[#5a5a62]">·</span>
                        <span className="font-mono text-[#888892]">{a.created_at.slice(0, 10)}</span>
                      </div>
                      <div className="font-bold text-stone-100 text-[16px] mt-2 truncate">
                        {a.title}
                      </div>
                      {fd?.headline && (
                        <p className="text-[13px] text-[#888892] mt-1 line-clamp-2 leading-relaxed">
                          {fd.headline}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {score != null ? (
                        <ScoreBadge score={score} />
                      ) : (
                        <MotionStatusBadge status={a.status} />
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {(analyses ?? []).length === 0 && (
            <li className="text-[14px] text-[#5a5a62] py-6 text-center bg-[#14141a] border border-[#2a2a30] rounded-lg">
              아직 분석이 없어요. 아래에서 첫 영상을 분석해보세요.
            </li>
          )}
        </ul>
      </section>

      {/* 2) 새 분석 폼 — 하단 (가끔 박는 거니까) */}
      <section>
        <details className="group" open={(analyses ?? []).length === 0}>
          <summary className="cursor-pointer flex items-center justify-between bg-[#14141a] border border-[#a3e635]/40 rounded-lg px-4 py-3.5 select-none hover:border-[#a3e635] transition">
            <span className="text-[15px] font-bold text-[#a3e635]">+ 새 영상 분석</span>
            <span className="text-[#5a5a62] group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="mt-3">
            <MotionForm userId={userId} />
          </div>
        </details>
      </section>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? '#a3e635' : score >= 50 ? '#facc15' : score >= 35 ? '#f97316' : '#f43f5e';
  return (
    <div
      className="px-3 py-1.5 rounded-lg font-bold text-[15px] font-mono"
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}40`,
      }}
    >
      {Math.round(score)}
      <span className="text-[11px] text-[#5a5a62] ml-0.5">/100</span>
    </div>
  );
}
