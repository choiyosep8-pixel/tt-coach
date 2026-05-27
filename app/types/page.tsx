import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { typeCode } from '@/lib/type-codes';
import type { OpponentType } from '@/lib/types';

export default async function TypesIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: types }, { data: strats }, { data: gameSessions }, { data: mastery }] =
    await Promise.all([
      supabase.from('opponent_types').select('*').order('sort_order'),
      supabase.from('counter_strategies').select('type_id').eq('user_id', user.id),
      supabase
        .from('sessions')
        .select('opponent_type_id')
        .eq('user_id', user.id)
        .not('opponent_type_id', 'is', null),
      supabase.from('type_mastery').select('*').eq('user_id', user.id),
    ]);

  const noteByType = (strats ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.type_id] = (acc[r.type_id] ?? 0) + 1;
    return acc;
  }, {});
  const gameByType = (gameSessions ?? []).reduce<Record<string, number>>((acc, r) => {
    if (!r.opponent_type_id) return acc;
    acc[r.opponent_type_id] = (acc[r.opponent_type_id] ?? 0) + 1;
    return acc;
  }, {});
  const masteryByType = (mastery ?? []).reduce<Record<string, { pct: number; partners: string[] }>>(
    (acc, r) => {
      acc[r.type_id] = { pct: r.mastery_percent ?? 0, partners: r.partners ?? [] };
      return acc;
    },
    {}
  );

  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">
          Opponent Catalog
        </div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">
          유형 <span className="text-[#a3e635]">컬렉션</span>
        </h1>
        <p className="text-[13px] text-[#888892] mt-3 leading-relaxed">
          여덟 가지 상대 유형을 *마스터*해가세요. 카드 안에서 마스터율과 시뮬레이션 파트너를
          관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {((types ?? []) as OpponentType[]).map((t) => {
          const notes = noteByType[t.id] ?? 0;
          const games = gameByType[t.id] ?? 0;
          const m = masteryByType[t.id] ?? { pct: 0, partners: [] };
          const code = typeCode(t.slug);
          const num = String(t.sort_order).padStart(2, '0');
          const mastered = m.pct >= 100;
          return (
            <Link
              prefetch
              key={t.id}
              href={`/types/${t.slug}`}
              className={`group relative block rounded-xl p-4 border transition overflow-hidden ${
                mastered
                  ? 'bg-[#1a1a22] border-[#a3e635] shadow-[0_0_24px_-6px_#a3e635]'
                  : m.pct >= 70
                  ? 'bg-[#14141a] border-[#a3e635]/50 hover:border-[#a3e635]'
                  : m.pct >= 30
                  ? 'bg-[#14141a] border-[#2a2a30] hover:border-[#a3e635]/60'
                  : 'bg-[#14141a] border-[#2a2a30] hover:border-[#a3e635]/40'
              }`}
            >
              {/* 마스터율 백그라운드 fill */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#a3e635]/[0.08] to-transparent transition-all"
                style={{ height: `${m.pct}%` }}
                aria-hidden
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[#5a5a62]">{num}</span>
                  {mastered ? (
                    <span className="font-mono text-[9px] tracking-[0.3em] text-[#a3e635]">
                      MASTER
                    </span>
                  ) : notes > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
                  ) : null}
                </div>

                <div className="mt-5">
                  <div className="font-mono text-[11px] tracking-[0.2em] text-[#a3e635]">{code}</div>
                  <div className="font-bold text-stone-100 text-[15px] mt-1">{t.label}</div>
                </div>

                <p className="text-[11px] text-[#888892] mt-2 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                {/* 마스터율 progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] mb-1">
                    <span className="text-[#5a5a62]">Mastery</span>
                    <span className="font-mono text-[#a3e635]">{m.pct}%</span>
                  </div>
                  <div className="h-1 bg-[#0a0a0a] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#a3e635] transition-all"
                      style={{
                        width: `${m.pct}%`,
                        boxShadow: m.pct >= 70 ? '0 0 8px #a3e635' : undefined,
                      }}
                    />
                  </div>
                </div>

                {/* 지인 */}
                {m.partners.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.partners.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[10px] text-[#888892]"
                      >
                        {p}
                      </span>
                    ))}
                    {m.partners.length > 3 && (
                      <span className="text-[10px] text-[#5a5a62]">+{m.partners.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-[#2a2a30] flex items-center gap-3 text-[10px] tracking-[0.15em] uppercase">
                  <span className="text-[#a3e635]">N{notes}</span>
                  <span className="text-[#5a5a62]">·</span>
                  <span className="text-[#888892]">G{games}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
