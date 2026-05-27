import type { MonthlyGoal, PlayerProfile } from '@/lib/types';

type Props = {
  ym: string;
  goal: MonthlyGoal | null;
  profile: PlayerProfile | null;
  collapsible?: boolean;
};

export function CoachBrief({ ym, goal, profile, collapsible = false }: Props) {
  const points = [goal?.focus_1, goal?.focus_2, goal?.focus_3].filter(Boolean) as string[];
  const isEmpty = !goal?.goal && points.length === 0 && !profile?.strengths && !profile?.weaknesses && !profile?.injuries && !profile?.coach_direction && !profile?.long_term_goal;

  const body = (
    <div className="bg-[#14141a] border border-[#a3e635]/30 rounded-xl p-4 space-y-4">
      {isEmpty ? (
        <p className="text-[12px] text-[#888892]">
          아직 비어있어요.{' '}
          <a href="/" className="text-[#a3e635] underline">홈에서 박기</a>
        </p>
      ) : (
        <>
          {(goal?.goal || points.length > 0) && (
            <section>
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#a3e635] mb-2">
                {ym} · Monthly
              </div>
              {goal?.goal && (
                <div className="text-[14px] font-semibold text-stone-100 leading-snug">
                  {goal.goal}
                </div>
              )}
              {points.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {points.map((p, i) => (
                    <li
                      key={i}
                      className="text-[12px] text-[#888892] leading-relaxed flex gap-2"
                    >
                      <span className="font-mono text-[10px] text-[#a3e635] mt-0.5 shrink-0">
                        0{i + 1}
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(profile?.strengths ||
            profile?.weaknesses ||
            profile?.injuries ||
            profile?.coach_direction ||
            profile?.long_term_goal) && (
            <section className="pt-3 border-t border-[#2a2a30] grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
              <Field label="Strength" color="#a3e635" value={profile?.strengths ?? null} />
              <Field label="Weakness" color="#f97316" value={profile?.weaknesses ?? null} />
              <Field label="Injury" color="#f43f5e" value={profile?.injuries ?? null} />
              <Field label="Coach Lead" color="#38bdf8" value={profile?.coach_direction ?? null} />
              <Field
                label="Long Goal"
                color="#facc15"
                value={profile?.long_term_goal ?? null}
                full
              />
            </section>
          )}
        </>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <details className="mb-6 group" open>
        <summary className="cursor-pointer text-[10px] uppercase tracking-[0.25em] text-[#888892] hover:text-stone-100 mb-2 select-none">
          ▾ Coach Brief
        </summary>
        {body}
      </details>
    );
  }
  return <div className="mb-6">{body}</div>;
}

function Field({
  label,
  color,
  value,
  full,
}: {
  label: string;
  color: string;
  value: string | null;
  full?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div
        className="text-[9px] uppercase tracking-[0.25em] mb-0.5 font-bold"
        style={{ color }}
      >
        {label}
      </div>
      <p className="text-[12px] text-stone-100 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}
