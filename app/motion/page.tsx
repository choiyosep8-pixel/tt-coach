import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MotionForm } from '@/components/motion-form';
import { MotionStatusBadge } from '@/components/motion-status-badge';
import type { MotionAnalysis } from '@/lib/types';

export default async function MotionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: analyses } = await supabase
    .from('motion_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <Link
        href="/"
        className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-stone-100 transition"
      >
        ← Catalog
      </Link>

      <header className="mt-4 mb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">Motion Analysis</div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">
          모션 <span className="text-[#a3e635]">비교</span>
        </h1>
        <p className="text-[13px] text-[#888892] mt-3 leading-relaxed">
          롤모델 유튜브 + 내 영상 → 클로드가 키프레임 비교해 피드백을 박아드립니다.
        </p>
      </header>

      {error && (
        <div className="mb-4 text-[11px] text-[#f97316] border border-[#f97316]/30 bg-[#f97316]/10 rounded px-3 py-2">
          {error}
        </div>
      )}

      <MotionForm userId={user.id} />

      <section className="mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-3">
          Recent ({analyses?.length ?? 0})
        </h2>
        <ul className="space-y-2">
          {((analyses ?? []) as MotionAnalysis[]).map((a) => (
            <li key={a.id}>
              <Link
                href={`/motion/${a.id}`}
                className="block bg-[#14141a] border border-[#2a2a30] rounded-lg p-4 hover:border-[#a3e635]/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                      <span className="font-mono text-[#5a5a62]">#{a.short_id}</span>
                      <span className="text-[#5a5a62]">·</span>
                      <span className="font-mono text-[#888892]">{a.created_at.slice(0, 10)}</span>
                    </div>
                    <div className="font-semibold text-stone-100 mt-2 truncate">{a.title}</div>
                    {a.focus && (
                      <p className="text-[12px] text-[#888892] mt-1 line-clamp-2 leading-relaxed">
                        {a.focus}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#5a5a62]">
                      {a.reference_url && <span>↗ Ref</span>}
                      {a.my_video_paths.length > 0 && (
                        <span>Video × {a.my_video_paths.length}</span>
                      )}
                    </div>
                  </div>
                  <MotionStatusBadge status={a.status} />
                </div>
              </Link>
            </li>
          ))}
          {(analyses ?? []).length === 0 && (
            <li className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62]">
              No analyses yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
