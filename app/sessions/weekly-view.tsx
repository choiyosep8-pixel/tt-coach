import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { KIND_BY_VALUE, type SessionKind } from '@/lib/session-kinds';
import { sessionSummary, KIND_EMOJI } from '@/lib/session-summary';

const DOW = ['월', '화', '수', '목', '금', '토', '일'];

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function WeeklyView({ userId, mondayIso }: { userId: string; mondayIso: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(mondayIso, i));
  const startStr = days[0];
  const endStr = days[6];

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_date, kind, title, worked, opponent_name, my_score, opp_score')
    .eq('user_id', userId)
    .gte('session_date', startStr)
    .lte('session_date', endStr)
    .order('session_date', { ascending: true })
    .order('created_at', { ascending: true });

  const byDate: Record<string, NonNullable<typeof sessions>> = {};
  (sessions ?? []).forEach((s) => {
    (byDate[s.session_date] ||= []).push(s);
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const prevMonday = addDays(mondayIso, -7);
  const nextMonday = addDays(mondayIso, 7);
  const isThisWeek = days.includes(todayStr);

  return (
    <div>
      <header className="flex items-center justify-between mb-3">
        <div className="font-mono text-[13px]">
          <span className="text-stone-100">{days[0].slice(5)}</span>
          <span className="text-[#5a5a62] mx-1.5">—</span>
          <span className="text-[#a3e635]">{days[6].slice(5)}</span>
          {isThisWeek && (
            <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-[#a3e635]">This Week</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link
            prefetch
            href={`/sessions?v=week&w=${prevMonday}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            ←
          </Link>
          {!isThisWeek && (
            <Link
              prefetch
              href="/sessions?v=week"
              className="px-3 py-1.5 border border-[#2a2a30] rounded text-[10px] uppercase tracking-[0.15em] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40"
            >
              Today
            </Link>
          )}
          <Link
            prefetch
            href={`/sessions?v=week&w=${nextMonday}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            →
          </Link>
        </div>
      </header>

      <div className="border border-[#2a2a30] rounded-lg overflow-hidden divide-y divide-[#2a2a30]">
        {days.map((date, idx) => {
          const rows = byDate[date] ?? [];
          const isToday = date === todayStr;
          const md = date.slice(5);
          return (
            <div key={date} className={`flex ${isToday ? 'bg-[#14141a]/60' : 'bg-[#0a0a0a]'}`}>
              {/* 좌측 요일·날짜 */}
              <div className="w-14 shrink-0 border-r border-[#2a2a30] py-3 px-2 flex flex-col items-center justify-start gap-0.5">
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    isToday ? 'text-[#a3e635] font-bold' : 'text-[#5a5a62]'
                  }`}
                >
                  {DOW[idx]}
                </span>
                <span
                  className={`font-mono text-[12px] ${
                    isToday ? 'text-[#a3e635]' : 'text-stone-100'
                  }`}
                >
                  {md}
                </span>
              </div>

              {/* 우측 요약 */}
              <div className="flex-1 py-2.5 pl-3 pr-2 flex flex-col gap-1.5">
                {rows.length === 0 ? (
                  <Link
                    prefetch
                    href={`/sessions/new?date=${date}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62] hover:text-[#a3e635] py-1 transition"
                  >
                    + 추가
                  </Link>
                ) : (
                  <>
                    {rows.map((s) => {
                      const summary = sessionSummary(s);
                      const color = KIND_BY_VALUE[s.kind as SessionKind].color;
                      return (
                        <Link
                          key={s.id}
                          prefetch
                          href={`/sessions/${s.id}`}
                          className="group flex items-center gap-2 -mx-1 px-2 py-1 rounded hover:bg-[#14141a] transition"
                        >
                          <span className="text-base shrink-0">{KIND_EMOJI[s.kind as SessionKind]}</span>
                          <span
                            className="w-0.5 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[13px] text-stone-100 truncate group-hover:text-[#a3e635]">
                            {summary}
                          </span>
                          <span className="ml-auto text-[10px] text-[#5a5a62] opacity-0 group-hover:opacity-100 shrink-0">
                            →
                          </span>
                        </Link>
                      );
                    })}
                    <Link
                      prefetch
                      href={`/sessions/new?date=${date}`}
                      className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] hover:text-[#a3e635] -mx-1 px-2 py-0.5 transition"
                    >
                      + 추가
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
