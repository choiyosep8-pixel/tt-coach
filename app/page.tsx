import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveMonthlyGoal, savePlayerProfile } from './goal-actions';
import { SubmitButton } from '@/components/submit-button';
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  const user = session.user;

  const ym = thisMonth();
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
      {/* 인사 — 작게 */}
      <div className="text-[13px] text-[#888892] mb-1">
        {ym.replace('-', '년 ')}월
      </div>
      <h1 className="text-[24px] font-bold tracking-tight mb-5">
        안녕하세요, <span className="text-[#a3e635]">{phone}</span>님
      </h1>

      {/* 이번달 목표 — 큰 카드, 한 화면 핵심 */}
      <section className="bg-[#14141a] border border-[#a3e635]/40 rounded-xl p-5 mb-5">
        <div className="text-[12px] text-[#a3e635] font-bold mb-2">
          이번달 성장 목표
        </div>
        <form action={saveMonthlyGoal} className="space-y-3">
          <input type="hidden" name="year_month" value={ym} />
          <input
            name="goal"
            defaultValue={goal?.goal ?? ''}
            maxLength={140}
            placeholder="예: 백핸드 푸시로 게임 5할 넘기기"
            className="w-full px-3 py-3 bg-[#0a0a0a] border border-[#2a2a30] rounded-lg text-stone-100 text-[16px] placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition"
          />

          <div className="text-[12px] text-[#888892]">
            집중 포인트 — 매 연습마다 떠올릴 것
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <span className="absolute top-1/2 -translate-y-1/2 left-3 text-[#a3e635] font-mono text-[14px] font-bold">
                  {i}
                </span>
                <input
                  name={`focus_${i}`}
                  defaultValue={
                    (goal as unknown as Record<string, string> | null)?.[`focus_${i}`] ?? ''
                  }
                  maxLength={80}
                  placeholder="포인트…"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded-lg text-stone-100 text-[15px] placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition"
                />
              </div>
            ))}
          </div>

          <SubmitButton label="이번달 계획 저장" pendingLabel="저장 중…" />
        </form>
      </section>

      {/* 메트릭 + 빠른 진입 — 한 행 */}
      <section className="grid grid-cols-2 gap-2 mb-5">
        <Stat label="평균 마스터율" value={`${avgMastery}%`} accent="#a3e635" />
        <Stat label={`${ym.slice(5)}월 세션`} value={`${sessionCount}건`} />
      </section>

      <section className="grid grid-cols-2 gap-2 mb-8">
        <QuickLink href="/sessions" label="+ 세션 기록" accent />
        <QuickLink href="/motion" label="📹 모션 분석" />
        <QuickLink href="/types" label="유형 컬렉션" />
        <QuickLink href="/sessions?v=calendar" label="📅 캘린더" />
      </section>

      {/* 코치 노트 — 접기 (필요할 때만 펴서) */}
      <section>
        <details className="group">
          <summary className="cursor-pointer flex items-center justify-between bg-[#14141a] border border-[#2a2a30] rounded-lg px-4 py-3 select-none hover:border-[#a3e635]/40 transition">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold">코치 ↔ 본인 공유 노트</span>
              {(profile?.strengths ||
                profile?.weaknesses ||
                profile?.injuries ||
                profile?.coach_direction ||
                profile?.long_term_goal) && (
                <span className="text-[11px] text-[#a3e635]">● 작성됨</span>
              )}
            </div>
            <span className="text-[#5a5a62] group-open:rotate-180 transition-transform">▾</span>
          </summary>

          <form action={savePlayerProfile} className="mt-3 space-y-3 bg-[#14141a] border border-[#2a2a30] rounded-xl p-4">
            <FieldBlock
              name="strengths"
              label="강점"
              color="#a3e635"
              defaultValue={profile?.strengths ?? ''}
              placeholder="예: 포핸드 드라이브 파워, 빠른 풋워크"
            />
            <FieldBlock
              name="weaknesses"
              label="약점"
              color="#f97316"
              defaultValue={profile?.weaknesses ?? ''}
              placeholder="예: 백핸드 푸시 부정확, 서비스 리시브 약함"
            />
            <FieldBlock
              name="injuries"
              label="부상·주의"
              color="#f43f5e"
              defaultValue={profile?.injuries ?? ''}
              placeholder="예: 오른쪽 어깨 회전근개 — 무리한 스매싱 금지"
            />
            <FieldBlock
              name="coach_direction"
              label="코치 리드 방향"
              color="#38bdf8"
              defaultValue={profile?.coach_direction ?? ''}
              placeholder="코치가 이번 분기에 잡아주고 싶은 방향"
            />
            <FieldBlock
              name="long_term_goal"
              label="장기 목표"
              color="#facc15"
              defaultValue={profile?.long_term_goal ?? ''}
              placeholder="예: 3부 승급, 동호회 대회 4강"
            />
            <SubmitButton label="프로필 저장" pendingLabel="저장 중…" />
            <p className="text-[12px] text-[#5a5a62] leading-relaxed">
              이 노트는 세션 페이지 상단에 자동 표시됩니다.
            </p>
          </form>
        </details>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-3.5">
      <div className="text-[12px] text-[#5a5a62]">{label}</div>
      <div
        className="mt-1 font-bold text-[22px] tracking-tight"
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
      className={`text-center py-3.5 rounded-lg text-[14px] font-bold transition ${
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
      <label className="text-[13px] block mb-1.5 font-bold" style={{ color }}>
        {label}
      </label>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[15px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition leading-relaxed"
      />
    </div>
  );
}
