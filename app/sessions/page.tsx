import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionForm } from '@/components/session-form';
import { SessionCard } from '@/components/session-card';
import { CoachBrief } from '@/components/coach-brief';
import { CalendarView } from './calendar-view';
import type { Session, MonthlyGoal, PlayerProfile } from '@/lib/types';

type SearchParams = Promise<{ v?: 'list' | 'calendar'; m?: string; d?: string }>;

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { v, m, d } = await searchParams;
  const view: 'list' | 'calendar' = v === 'calendar' ? 'calendar' : 'list';
  const ym = thisMonth();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: opponentTypes },
    { data: goal },
    { data: profile },
    { data: sessions },
  ] = await Promise.all([
    supabase
      .from('opponent_types')
      .select('id,slug,label,icon')
      .order('sort_order'),
    supabase
      .from('monthly_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('year_month', ym)
      .maybeSingle<MonthlyGoal>(),
    supabase
      .from('player_profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<PlayerProfile>(),
    view === 'list'
      ? supabase
          .from('sessions')
          .select(`
            id, session_date, kind, title, opponent_type_id, opponent_name,
            my_score, opp_score, worked, failed, video_paths, reference_url,
            feedback, notes, created_at,
            type:opponent_types(label,icon,slug)
          `)
          .order('session_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">Training Log</div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">세션</h1>
      </div>

      <CoachBrief ym={ym} goal={goal ?? null} profile={profile ?? null} collapsible />

      {/* View toggle */}
      <div className="inline-flex border border-[#2a2a30] rounded overflow-hidden mb-4">
        <Link
          prefetch
          href="/sessions?v=list"
          className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
            view === 'list' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
          }`}
        >
          List
        </Link>
        <Link
          prefetch
          href="/sessions?v=calendar"
          className={`px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
            view === 'calendar' ? 'bg-[#a3e635] text-[#0a0a0a] font-bold' : 'text-[#888892] hover:text-stone-100'
          }`}
        >
          Calendar
        </Link>
      </div>

      {view === 'list' ? (
        <>
          <SessionForm
            userId={user.id}
            opponentTypes={
              (opponentTypes ?? []) as Array<{
                id: string;
                slug: string;
                label: string;
                icon: string | null;
              }>
            }
          />
          <div className="mt-8">
            <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-3">
              Recent ({sessions?.length ?? 0})
            </h2>
            <ul className="space-y-2">
              {((sessions ?? []) as unknown as Array<
                Session & {
                  type:
                    | { label: string; icon: string | null; slug: string }
                    | { label: string; icon: string | null; slug: string }[]
                    | null;
                }
              >).map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
              {(sessions ?? []).length === 0 && (
                <li className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62]">
                  No sessions yet.
                </li>
              )}
            </ul>
          </div>
        </>
      ) : (
        <CalendarView userId={user.id} month={m} selectedDay={d} />
      )}
    </div>
  );
}
