import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { OpponentType } from '@/lib/types';
import { typeCode } from '@/lib/type-codes';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: types } = await supabase
    .from('opponent_types')
    .select('*')
    .order('sort_order');

  const { data: strats } = await supabase
    .from('counter_strategies')
    .select('type_id');

  const { data: gameSessions } = await supabase
    .from('sessions')
    .select('opponent_type_id')
    .not('opponent_type_id', 'is', null);

  const noteCount = (strats ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.type_id] = (acc[r.type_id] ?? 0) + 1;
    return acc;
  }, {});
  const gameCount = (gameSessions ?? []).reduce<Record<string, number>>((acc, r) => {
    if (!r.opponent_type_id) return acc;
    acc[r.opponent_type_id] = (acc[r.opponent_type_id] ?? 0) + 1;
    return acc;
  }, {});

  const phone = user?.user_metadata?.display_name ?? user?.email ?? '';

  return (
    <div>
      {/* 헤로 */}
      <section className="mb-10 pt-3">
        <div className="text-[11px] tracking-[0.3em] text-[#5a5a62] uppercase">
          Opponent Catalog
        </div>
        <h1 className="text-[28px] font-bold mt-3 leading-[1.2] tracking-tight">
          오늘 만난 상대는<br />
          <span className="text-[#a3e635]">어떤 유형</span>이었나요?
        </h1>
        <p className="text-[13px] text-[#888892] mt-3 leading-relaxed">
          {phone} · 여덟 가지 유형 안에 파훼법과 실패 패턴을 쌓아갑니다.
        </p>
      </section>

      {/* 8유형 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {((types ?? []) as OpponentType[]).map((t) => {
          const notes = noteCount[t.id] ?? 0;
          const games = gameCount[t.id] ?? 0;
          const code = typeCode(t.slug);
          const num = String(t.sort_order).padStart(2, '0');
          return (
            <Link
              key={t.id}
              href={`/types/${t.slug}`}
              className="group relative block bg-[#14141a] border border-[#2a2a30] rounded-xl p-4 hover:border-[#a3e635]/60 hover:bg-[#1a1a22] transition"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#5a5a62]">{num}</span>
                {notes > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
                )}
              </div>
              <div className="mt-5">
                <div className="font-mono text-[11px] tracking-[0.2em] text-[#a3e635]">{code}</div>
                <div className="font-bold text-stone-100 text-[15px] mt-1">{t.label}</div>
              </div>
              <p className="text-[11px] text-[#888892] mt-2 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
              <div className="mt-4 pt-3 border-t border-[#2a2a30] flex items-center gap-3 text-[10px] tracking-[0.15em] uppercase">
                <span className="text-[#a3e635] font-semibold">Notes {notes}</span>
                <span className="text-[#5a5a62]">·</span>
                <span className="text-[#888892]">Games {games}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 빠른 액션 */}
      <div className="mt-8 grid grid-cols-3 gap-2">
        <Link
          href="/sessions"
          className="text-center py-3 bg-[#a3e635] text-[#0a0a0a] font-bold rounded-lg hover:bg-lime-300 transition text-[12px] uppercase tracking-[0.15em]"
        >
          + Log Session
        </Link>
        <Link
          href="/calendar"
          className="text-center py-3 bg-[#14141a] border border-[#2a2a30] text-stone-100 font-medium rounded-lg hover:border-[#a3e635]/40 transition text-[12px] uppercase tracking-[0.15em]"
        >
          Calendar
        </Link>
        <Link
          href="/sessions"
          className="text-center py-3 bg-[#14141a] border border-[#2a2a30] text-stone-100 font-medium rounded-lg hover:border-[#a3e635]/40 transition text-[12px] uppercase tracking-[0.15em]"
        >
          Video
        </Link>
      </div>
    </div>
  );
}
