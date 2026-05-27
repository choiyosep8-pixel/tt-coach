import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KIND_BY_VALUE, type SessionKind } from '@/lib/session-kinds';
import { SessionCard } from '@/components/session-card';
import type { Session } from '@/lib/types';

type SearchParams = Promise<{ m?: string; v?: 'grid' | 'list'; d?: string }>;

function monthRange(m: string) {
  const [yStr, moStr] = m.split('-');
  const y = Number(yStr);
  const mo = Number(moStr);
  const start = new Date(Date.UTC(y, mo - 1, 1));
  const end = new Date(Date.UTC(y, mo, 0));
  return { y, mo, start, end };
}
function pad(n: number) {
  return String(n).padStart(2, '0');
}
function thisMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}
function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { m: mRaw, v: vRaw, d } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const m = mRaw && /^\d{4}-\d{2}$/.test(mRaw) ? mRaw : thisMonth();
  const v: 'grid' | 'list' = vRaw === 'list' ? 'list' : 'grid';
  const { y, mo, start, end } = monthRange(m);

  const startStr = `${y}-${pad(mo)}-01`;
  const endStr = `${y}-${pad(mo)}-${pad(end.getUTCDate())}`;

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, session_date, kind, title, opponent_type_id, opponent_name,
      my_score, opp_score, worked, failed, video_paths, reference_url,
      feedback, notes, created_at,
      type:opponent_types(label,icon,slug)
    `)
    .gte('session_date', startStr)
    .lte('session_date', endStr)
    .order('session_date', { ascending: true })
    .order('created_at', { ascending: true });

  const byDate: Record<string, NonNullable<typeof sessions>> = {};
  (sessions ?? []).forEach((s) => {
    (byDate[s.session_date] ||= []).push(s);
  });

  // 그리드: 그 달의 1일 요일부터 시작해서 6주 슬롯
  const firstDow = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay();
  const daysInMonth = end.getUTCDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: `${y}-${pad(mo)}-${pad(day)}`, day });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDay = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  const selectedRows = selectedDay ? byDate[selectedDay] ?? [] : [];

  return (
    <div>
      <Link href="/" className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-stone-100 transition">
        ← Catalog
      </Link>

      <header className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">Calendar</div>
          <h1 className="text-3xl font-bold mt-2 tracking-tight">
            <span className="font-mono">{y}</span>
            <span className="text-[#888892] mx-2">·</span>
            <span className="text-[#a3e635] font-mono">{pad(mo)}</span>
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/calendar?m=${shiftMonth(m, -1)}&v=${v}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            ←
          </Link>
          <Link
            href={`/calendar?m=${thisMonth()}&v=${v}`}
            className="px-3 py-1.5 border border-[#2a2a30] rounded text-[10px] uppercase tracking-[0.15em] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40"
          >
            Today
          </Link>
          <Link
            href={`/calendar?m=${shiftMonth(m, 1)}&v=${v}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            →
          </Link>
        </div>
      </header>

      {/* View toggle */}
      <div className="inline-flex border border-[#2a2a30] rounded overflow-hidden mb-4">
        <Link
          href={`/calendar?m=${m}&v=grid${selectedDay ? `&d=${selectedDay}` : ''}`}
          className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
            v === 'grid' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
          }`}
        >
          Grid
        </Link>
        <Link
          href={`/calendar?m=${m}&v=list`}
          className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
            v === 'list' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
          }`}
        >
          List
        </Link>
      </div>

      {v === 'grid' ? (
        <>
          <div className="grid grid-cols-7 gap-px bg-[#2a2a30] border border-[#2a2a30] rounded-lg overflow-hidden">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div
                key={d}
                className="bg-[#0a0a0a] text-center py-2 text-[10px] uppercase tracking-[0.2em] text-[#5a5a62]"
              >
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              if (!c.date) {
                return <div key={i} className="bg-[#0a0a0a] aspect-square" />;
              }
              const rows = byDate[c.date] ?? [];
              const isToday = c.date === todayStr;
              const isSelected = c.date === selectedDay;
              return (
                <Link
                  key={i}
                  href={`/calendar?m=${m}&v=grid&d=${c.date}`}
                  className={`bg-[#0a0a0a] aspect-square p-1.5 flex flex-col gap-1 hover:bg-[#14141a] transition ${
                    isSelected ? 'ring-1 ring-[#a3e635] ring-inset' : ''
                  }`}
                >
                  <div
                    className={`text-[11px] font-mono ${
                      isToday ? 'text-[#a3e635] font-bold' : 'text-[#888892]'
                    }`}
                  >
                    {c.day}
                  </div>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {rows.slice(0, 5).map((r) => (
                      <span
                        key={r.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: KIND_BY_VALUE[r.kind as SessionKind].color }}
                      />
                    ))}
                    {rows.length > 5 && (
                      <span className="text-[8px] text-[#5a5a62]">+{rows.length - 5}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 선택된 날짜 세션 */}
          {selectedDay && (
            <section className="mt-6">
              <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-3 font-mono">
                {selectedDay} · {selectedRows.length} session
                {selectedRows.length === 1 ? '' : 's'}
              </h2>
              {selectedRows.length > 0 ? (
                <ul className="space-y-2">
                  {(selectedRows as unknown as Array<Session & { type: { label: string; icon: string | null; slug: string } | { label: string; icon: string | null; slug: string }[] | null }>).map(
                    (s) => (
                      <SessionCard key={s.id} session={s} />
                    )
                  )}
                </ul>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62]">
                  No sessions on this day.{' '}
                  <Link href="/sessions" className="text-[#a3e635] underline">
                    Log one →
                  </Link>
                </p>
              )}
            </section>
          )}

          {/* 카테고리 범례 */}
          <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.15em]">
            {Object.values(KIND_BY_VALUE).map((k) => (
              <span key={k.value} className="flex items-center gap-1.5 text-[#888892]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: k.color }} />
                {k.code}
              </span>
            ))}
          </div>
        </>
      ) : (
        /* List view */
        <ul className="space-y-2">
          {(sessions ?? []).length === 0 ? (
            <li className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62]">
              No sessions in {y}-{pad(mo)}.{' '}
              <Link href="/sessions" className="text-[#a3e635] underline">
                Log one →
              </Link>
            </li>
          ) : (
            (sessions as unknown as Array<Session & { type: { label: string; icon: string | null; slug: string } | { label: string; icon: string | null; slug: string }[] | null }>).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))
          )}
        </ul>
      )}
    </div>
  );
}
