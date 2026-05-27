import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveMonthlyGoal, savePlayerProfile } from './goal-actions';
import type { MonthlyGoal, PlayerProfile } from '@/lib/types';

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type DashPayload = {
  goal: MonthlyGoal | null;
  profile: PlayerProfile | null;
  mastery_avg: number;
  session_count: number;
};

export default async function HomePage() {
  const supabase = await createClient();

  // getSession = cookie JWT 디코드만 (no Auth round-trip)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  const user = session.user;

  const ym = thisMonth();

  // 단일 RPC = 1 round-trip
  const { data: dashRaw } = await supabase.rpc('get_home_dashboard', {
    p_year_month: ym,
  });
  const dash = (dashRaw ?? {}) as Partial<DashPayload>;
  const goal = dash.goal ?? null;
  const profile = dash.profile ?? null;
  const avgMastery = dash.mastery_avg ?? 0;
  const sessionCount = dash.session_count ?? 0;
  const phone = user.user_metadata?.display_name ?? user.email ?? '';

  return (
    <div>
      <section className="pt-2 mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a62]">
          {ym} · Monthly Plan
        </div>

        <form action={saveMonthlyGoal} className="mt-3 space-y-3">
          <input type="hidden" name="year_month" value={ym} />

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] block mb-1.5">
              이번달 성장 목표
            </label>
            <input
              name="goal"
              defaultValue={goal?.goal ?? ''}
              maxLength={140}
              placeholder="예: 백핸드 푸시로 게임 5할 넘기기"
              className="w-full px-3 py-3 bg-[#14141a] border border-[#2a2a30] rounded-lg text-stone-100 text-[15px] placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#888892] block mb-1.5">
              집중 포인트 3 — 매 연습마다 떠올릴 것
            </label>
            <div className="grid sm:grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  <span className="absolute top-2 left-2.5 font-mono text-[10px] text-[#5a5a62]">
                    0{i}
                  </span>
                  <input
                    name={`focus_${i}`}
                    defaultValue={
                      (goal as unknown as Record<string, string> | null)?.[`focus_${i}`] ?? ''
                    }
                    maxLength={80}
                    placeholder="포인트…"
                    className="w-full pt-7 pb-3 px-2.5 bg-[#14141a] border border-[#2a2a30] rounded-lg text-stone-100 text-sm placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-lime-300 transition"
          >
            Save Plan
          </button>
        </form>
      </section>

      <section className="grid grid-cols-3 gap-2 mb-8">
        <Stat label="Mastery Avg" value={`${avgMastery}%`} accent="#a3e635" />
        <Stat label={`Sessions ${ym.slice(5)}`} value={String(sessionCount)} />
        <Stat label="Player" value={phone} small />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
        <QuickLink href="/sessions" label="세션 기록" accent />
        <QuickLink href="/types" label="유형 분석" />
        <QuickLink href="/motion" label="모션 분석" />
        <QuickLink href="/sessions?v=calendar" label="캘린더" />
      </section>

      <section>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#5a5a62] mb-3">
          Player Profile · 코치 ↔ 본인 공유 노트
        </div>
        <form action={savePlayerProfile} className="space-y-3 bg-[#14141a] border border-[#2a2a30] rounded-xl p-4">
          <FieldBlock
            name="strengths"
            label="Strengths · 강점"
            color="#a3e635"
            defaultValue={profile?.strengths ?? ''}
            placeholder="예: 포핸드 드라이브 파워, 빠른 풋워크"
          />
          <FieldBlock
            name="weaknesses"
            label="Weaknesses · 약점"
            color="#f97316"
            defaultValue={profile?.weaknesses ?? ''}
            placeholder="예: 백핸드 푸시 부정확, 서비스 리시브에서 자주 실점"
          />
          <FieldBlock
            name="injuries"
            label="Injuries · 부상·주의"
            color="#f43f5e"
            defaultValue={profile?.injuries ?? ''}
            placeholder="예: 오른쪽 어깨 회전근개 — 무리한 스매싱 금지"
          />
          <FieldBlock
            name="coach_direction"
            label="Coach Lead · 코치 리드 방향"
            color="#38bdf8"
            defaultValue={profile?.coach_direction ?? ''}
            placeholder="코치가 이번 분기에 잡아주고 싶은 방향"
          />
          <FieldBlock
            name="long_term_goal"
            label="Long-term Goal · 장기 목표"
            color="#facc15"
            defaultValue={profile?.long_term_goal ?? ''}
            placeholder="예: 3부 승급, 동호회 대회 4강"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-lime-300 transition"
          >
            Save Profile
          </button>
        </form>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] mt-3">
          이 노트는 세션 페이지 상단 Coach Brief에 자동 표시됩니다.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-3">
      <div className="text-[9px] uppercase tracking-[0.2em] text-[#5a5a62]">{label}</div>
      <div
        className={`mt-1 font-bold ${small ? 'text-[13px]' : 'text-xl'} truncate`}
        style={{ color: accent ?? '#f5f5f4' }}
      >
        {value}
      </div>
    </div>
  );
}

function QuickLink({ href, label, accent }: { href: string; label: string; accent?: boolean }) {
  return (
    <Link
      prefetch
      href={href}
      className={`text-center py-3 rounded-lg text-[11px] uppercase tracking-[0.2em] font-bold transition ${
        accent
          ? 'bg-[#a3e635] text-[#0a0a0a] hover:bg-lime-300'
          : 'bg-[#14141a] border border-[#2a2a30] text-stone-100 hover:border-[#a3e635]/40'
      }`}
    >
      {label}
    </Link>
  );
}

function FieldBlock({
  name,
  label,
  color,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  color: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] block mb-1.5 font-bold" style={{ color }}>
        {label}
      </label>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[13px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition leading-relaxed"
      />
    </div>
  );
}
