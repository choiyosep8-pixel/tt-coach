import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionForm } from '@/components/session-form';

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: opponentTypes } = await supabase
    .from('opponent_types')
    .select('id,slug,label,icon')
    .order('sort_order');

  const dateStr =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);

  return (
    <div>
      <Link
        href="/sessions"
        prefetch
        className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62] hover:text-stone-100 transition"
      >
        ← 캘린더
      </Link>
      <div className="mt-4 mb-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a62]">New Session</div>
        <h1 className="text-2xl font-bold mt-2 tracking-tight">
          <span className="font-mono text-[#a3e635]">{dateStr}</span> 기록
        </h1>
      </div>

      <SessionForm
        userId={session.user.id}
        opponentTypes={
          (opponentTypes ?? []) as Array<{
            id: string;
            slug: string;
            label: string;
            icon: string | null;
          }>
        }
        defaultDate={dateStr}
      />
    </div>
  );
}
