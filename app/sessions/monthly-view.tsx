import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { type SessionKind } from '@/lib/session-kinds';
import { dominantKind, KIND_EMOJI } from '@/lib/session-summary';

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}
function monthRange(m: string) {
  const [y, mo] = m.split('-').map(Number);
  const start = new Date(Date.UTC(y, mo - 1, 1));
  const end = new Date(Date.UTC(y, mo, 0));
  return { y, mo, start, end };
}

export async function MonthlyView({ userId, month }: { userId: string; month: string }) {
  const m = /^\d{4}-\d{2}$/.test(month) ? month : thisMonth();
  const { y, mo, end } = monthRange(m);
  const startStr = `${y}-${pad(mo)}-01`;
  const endStr = `${y}-${pad(mo)}-${pad(end.getUTCDate())}`;

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_date, kind')
    .eq('user_id', userId)
    .gte('session_date', startStr)
    .lte('session_date', endStr);

  const byDate: Record<string, Array<{ kind: SessionKind }>> = {};
  (sessions ?? []).forEach((s) => {
    (byDate[s.session_date] ||= []).push({ kind: s.kind as SessionKind });
  });

  // 월요일 시작 그리드
  const firstDow = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7; // 월=0
  const daysInMonth = end.getUTCDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: `${y}-${pad(mo)}-${pad(day)}`, day });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <header className="flex items-center justify-between mb-3">
        <div className="font-mono text-[14px]">
          <span>{y}</span>
          <span className="text-[#888892] mx-2">·</span>
          <span className="text-[#a3e635]">{pad(mo)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            prefetch
            href={`/sessions?v=month&m=${shiftMonth(m, -1)}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            ←
          </Link>
          <Link
            prefetch
            href={`/sessions?v=month&m=${thisMonth()}`}
            className="px-3 py-1.5 border border-[#2a2a30] rounded text-[10px] uppercase tracking-[0.15em] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40"
          >
            Today
          </Link>
          <Link
            prefetch
            href={`/sessions?v=month&m=${shiftMonth(m, 1)}`}
            className="px-2.5 py-1.5 border border-[#2a2a30] rounded text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40 text-sm"
          >
            →
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-px bg-[#2a2a30] border border-[#2a2a30] rounded-lg overflow-hidden">
        {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
          <div
            key={d}
            className="bg-[#0a0a0a] text-center py-2 text-[10px] uppercase tracking-[0.2em] text-[#5a5a62]"
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (!c.date) return <div key={i} className="bg-[#0a0a0a] aspect-square" />;
          const rows = byDate[c.date] ?? [];
          const k = dominantKind(rows);
          const isToday = c.date === todayStr;
          const href = rows.length > 0
            ? `/sessions?v=week&w=${weekMondayOf(c.date)}`
            : `/sessions/new?date=${c.date}`;
          return (
            <Link
              key={i}
              prefetch
              href={href}
              className={`bg-[#0a0a0a] aspect-square p-1 flex flex-col items-center justify-between hover:bg-[#14141a] transition ${
                isToday ? 'ring-1 ring-[#a3e635] ring-inset' : ''
              }`}
            >
              <span
                className={`text-[10px] font-mono self-start ${
                  isToday ? 'text-[#a3e635] font-bold' : 'text-[#888892]'
                }`}
              >
                {c.day}
              </span>
              {k ? (
                <span className="text-xl">{KIND_EMOJI[k]}</span>
              ) : (
                <span className="text-[10px] text-[#2a2a30]">·</span>
              )}
              {rows.length > 1 && (
                <span className="text-[8px] text-[#5a5a62] font-mono">×{rows.length}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.15em]">
        {Object.entries(KIND_EMOJI).map(([k, e]) => (
          <span key={k} className="flex items-center gap-1.5 text-[#888892]">
            <span>{e}</span>
            <span>{k}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function weekMondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (dow - 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
