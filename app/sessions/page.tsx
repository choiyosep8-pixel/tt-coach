import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoachBrief } from '@/components/coach-brief';
import { WeeklyView } from './weekly-view';
import { MonthlyView } from './monthly-view';
import type { MonthlyGoal, PlayerProfile } from '@/lib/types';

type SearchParams = Promise<{
  v?: 'week' | 'month';
  w?: string;
  m?: string;
}>;

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toIsoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// 주어진 날짜가 속한 주의 월요일을 ISO 형식으로 반환
function mondayOf(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay() || 7; // 0(일) → 7
  d.setUTCDate(d.getUTCDate() - (dow - 1));
  return d;
}

export default async function SessionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { v, w, m } = await searchParams;
  const view: 'week' | 'month' = v === 'month' ? 'month' : 'week';
  const ym = thisMonth();
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  const userId = session.user.id;

  const [{ data: goal }, { data: profile }] = await Promise.all([
    supabase
      .from('monthly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('year_month', ym)
      .maybeSingle<MonthlyGoal>(),
    supabase
      .from('player_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle<PlayerProfile>(),
  ]);

  let weekMonday: Date;
  if (view === 'week') {
    weekMonday = w && /^\d{4}-\d{2}-\d{2}$/.test(w) ? new Date(`${w}T00:00:00Z`) : mondayOf(new Date());
  } else {
    weekMonday = mondayOf(new Date()); // not used in month view
  }
  const monthStr = m && /^\d{4}-\d{2}$/.test(m) ? m : thisMonth();

  return (
    <div>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">Training Log</div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">세션</h1>
      </div>

      <CoachBrief ym={ym} goal={goal ?? null} profile={profile ?? null} collapsible />

      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex border border-[#2a2a30] rounded overflow-hidden">
          <Link
            prefetch
            href="/sessions?v=week"
            className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
              view === 'week' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
            }`}
          >
            주간
          </Link>
          <Link
            prefetch
            href="/sessions?v=month"
            className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
              view === 'month' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
            }`}
          >
            월별
          </Link>
        </div>
        <Link
          prefetch
          href={`/sessions/new?date=${toIsoDate(new Date())}`}
          className="px-3.5 py-1.5 bg-[#a3e635] text-[#0a0a0a] rounded text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-lime-300 transition"
        >
          + 오늘 추가
        </Link>
      </div>

      {view === 'week' ? (
        <WeeklyView userId={userId} mondayIso={toIsoDate(weekMonday)} />
      ) : (
        <MonthlyView userId={userId} month={monthStr} />
      )}
    </div>
  );
}
