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

type RecentMotion = {
  id: string;
  short_id: string;
  title: string;
  status: string;
  score: number | null;
  headline: string | null;
  created_at: string;
};

type DashPayload = {
  goal: MonthlyGoal | null;
  profile: PlayerProfile | null;
  mastery_avg: number;
  session_count: number;
  recent_motion: RecentMotion | null;
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
  const recentMotion = dash.recent_motion ?? null;
  const phone = user.user_metadata?.display_name ?? user.email ?? '';

  return (
    <div>
      {/* 인사 */}
      <div className="text-[14px] text-[#888892] mb-1">
        {ym.replace('-', '년 ')}월
      </div>
      <h1 className="text-[28px] font-bold tracking-tight mb-6 leading-tight">
        안녕하세요,<br />
        <span className="text-[#a3e635]">{phone}</span>님
      </h1>

      {/* 1) 최근 모션 점수 — 있으면 큼지막하게 */}
      {recentMotion && recentMotion.score != null && (
        <Link
          href={`/motion/${recentMotion.id}`}
          className="block mb-5 bg-[#14141a] border border-[#2a2a30] rounded-xl p-4 hover:border-[#a3e635]/60 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#5a5a62] mb-1.5">최근 모션 점수</div>
              <div className="font-bold text-stone-100 text-[16px] truncate">
                {recentMotion.title}
              </div>
              {recentMotion.headline && (
                <p className="text-[13px] text-[#888892] mt-1.5 line-clamp-2 leading-relaxed">
                  {recentMotion.headline}
                </p>
              )}
            </div>
            <BigScore score={recentMotion.score} />
          </div>
        </Link>
      )}
      {recentMotion && recentMotion.score == null && (
        <Link
          href={`/motion/${recentMotion.id}`}
          className="block mb-5 bg-[#14141a] border border-[#facc15]/40 rounded-xl p-4 hover:border-[#facc15] transition"
        >
          <div className="text-[12px] text-[#facc15] mb-1.5">분석 대기 중</div>
          <div className="font-bold text-stone-100 text-[16px] truncate">{recentMotion.title}</div>
          <p className="text-[13px] text-[#888892] mt-1.5">
            클로드 코드 채팅에 *motion {recentMotion.short_id}* 던지세요.
          </p>
        </Link>
      )}

      {/* 2) 이번달 목표 — 큰 카드 */}
      <section className="bg-[#14141a] border border-[#a3e635]/40 rounded-xl p-5 mb-5">
        <div className="text-[14px] text-[#a3e635] font-bold mb-3">
          이번달 성장 목표
        </div>
        <form action={saveMonthlyGoal} className="space-y-3">
          <input type="hidden" name="year_month" value={ym} />
          <input
            name="goal"
            defaultValue={goal?.goal ?? ''}
            maxLength={140}
            placeholder="예: 백핸드 푸시로 게임 5할"
            className="w-full px-3 py-3.5 bg-[#0a0a0a] border border-[#2a2a30] rounded-lg text-stone-100 text-[16px] placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition"
          />

          <div className="text-[13px] text-[#888892]">
            집중 포인트 — 매 연습마다 떠올릴 것
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <span className="absolute top-1/2 -translate-y-1/2 left-3 text-[#a3e635] font-mono text-[15px] font-bold">
                  {i}
                </span>
                <input
                  name={`focus_${i}`}
                  defaultValue={
                    (goal as unknown as Record<string, string> | null)?.[`focus_${i}`] ?? ''
                  }
                  maxLength={80}
                  placeholder="포인트…"
                  className="w-full pl-9 pr-3 py-3 bg-[#0a0a0a] border border-[#2a2a30] rounded-lg text-stone-100 text-[16px] placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition"
                />
              </div>
            ))}
          </div>

          <SubmitButton label="저장" pendingLabel="저장 중…" />
        </form>
      </section>

      {/* 3) 메트릭 — 큰 숫자 */}
      <section className="grid grid-cols-2 gap-2.5 mb-5">
        <Stat label="평균 마스터율" value={`${avgMastery}%`} accent="#a3e635" />
        <Stat label={`이번달 세션`} value={`${sessionCount}건`} />
      </section>

      {/* 4) 빠른 진입 — 큰 버튼 */}
      <section className="grid grid-cols-2 gap-2.5 mb-8">
        <QuickLink href="/sessions" label="+ 세션 기록" accent />
        <QuickLink href="/motion" label="📹 모션 분석" />
        <QuickLink href="/types" label="유형 컬렉션" />
        <QuickLink href="/sessions?v=calendar" label="📅 캘린더" />
      </section>

      {/* 5) 코치 노트 — 접기 */}
      <section>
        <details className="group">
          <summary className="cursor-pointer flex items-center justify-between bg-[#14141a] border border-[#2a2a30] rounded-lg px-4 py-3.5 select-none hover:border-[#a3e635]/40 transition">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[16px] font-bold">코치 ↔ 본인 공유 노트</span>
              {(profile?.strengths ||
                profile?.weaknesses ||
                profile?.injuries ||
                profile?.coach_direction ||
                profile?.long_term_goal) && (
                <span className="text-[12px] text-[#a3e635]">● 작성됨</span>
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
              placeholder="예: 백핸드 푸시 부정확"
            />
            <FieldBlock
              name="injuries"
              label="부상·주의"
              color="#f43f5e"
              defaultValue={profile?.injuries ?? ''}
              placeholder="예: 오른쪽 어깨 — 무리한 스매싱 금지"
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
            <p className="text-[13px] text-[#5a5a62] leading-relaxed">
              세션 페이지 상단에 자동 표시됩니다.
            </p>
          </form>
        </details>
      </section>
    </div>
  );
}

function BigScore({ score }: { score: number }) {
  const s = Math.round(score);
  const color =
    s >= 70 ? '#a3e635' : s >= 50 ? '#facc15' : s >= 35 ? '#f97316' : '#f43f5e';
  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center rounded-xl px-4 py-3 min-w-[72px]"
      style={{
        color,
        backgroundColor: `${color}12`,
        border: `1px solid ${color}50`,
      }}
    >
      <div className="font-bold text-[28px] leading-none font-mono">{s}</div>
      <div className="text-[10px] text-[#5a5a62] mt-1">/ 100</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-4">
      <div className="text-[13px] text-[#5a5a62]">{label}</div>
      <div
        className="mt-1.5 font-bold text-[26px] tracking-tight leading-none"
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
      className={`text-center py-4 rounded-xl text-[15px] font-bold transition ${
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
      <label className="text-[14px] block mb-1.5 font-bold" style={{ color }}>
        {label}
      </label>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded-lg text-[16px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] transition leading-relaxed"
      />
    </div>
  );
}
