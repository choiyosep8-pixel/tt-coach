import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionForm } from '@/components/session-form';
import { SessionCard } from '@/components/session-card';
import type { Session } from '@/lib/types';

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: opponentTypes } = await supabase
    .from('opponent_types')
    .select('id,slug,label,icon')
    .order('sort_order');

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, session_date, kind, title, opponent_type_id, opponent_name,
      my_score, opp_score, worked, failed, video_paths, reference_url,
      feedback, notes, created_at,
      type:opponent_types(label,icon,slug)
    `)
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <Link href="/" className="text-[11px] tracking-[0.2em] uppercase text-[#5a5a62] hover:text-stone-100 transition">
        ← 홈
      </Link>
      <div className="mt-3 mb-6">
        <div className="text-[11px] tracking-[0.25em] text-[#5a5a62] uppercase">Training Log</div>
        <h1 className="text-3xl font-bold mt-2">세션 기록</h1>
      </div>

      <SessionForm
        userId={user.id}
        opponentTypes={(opponentTypes ?? []) as Array<{ id: string; slug: string; label: string; icon: string | null }>}
      />

      <div className="mt-8">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-[#888892] mb-3">
          최근 ({sessions?.length ?? 0})
        </h2>
        <ul className="space-y-2">
          {((sessions ?? []) as unknown as Array<Session & { type: { label: string; icon: string | null; slug: string } | { label: string; icon: string | null; slug: string }[] | null }>).map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
          {(sessions ?? []).length === 0 && (
            <li className="text-[12px] text-[#5a5a62] italic">
              아직 세션 기록이 없습니다. 위에서 첫 기록을 남겨보세요.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
