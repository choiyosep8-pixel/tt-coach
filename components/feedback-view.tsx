import type { FeedbackData } from '@/lib/types';

const CONFIDENCE_LABEL = {
  low: 'LOW · 멀리·각도 한계',
  medium: 'MEDIUM',
  high: 'HIGH · 정밀',
} as const;

export function FeedbackView({ data }: { data: FeedbackData }) {
  const s = Math.round(data.overall_score);
  const grade =
    s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 35 ? 'D' : 'F';
  const ringColor =
    s >= 70 ? '#a3e635' : s >= 50 ? '#facc15' : s >= 35 ? '#f97316' : '#f43f5e';

  return (
    <div className="space-y-5">
      {/* 점수 헤로 */}
      <section
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: `${ringColor}0d`,
          borderColor: `${ringColor}55`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* 큰 점수 원 */}
          <div className="shrink-0 relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeDasharray={`${(2 * Math.PI * 44 * s) / 100} 999`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${ringColor}aa)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-mono font-bold text-2xl leading-none"
                style={{ color: ringColor }}
              >
                {s}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#888892] mt-0.5">
                / 100
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#5a5a62]">
              vs Reference (100)
            </div>
            <div
              className="font-mono text-4xl font-bold leading-none mt-1"
              style={{ color: ringColor }}
            >
              {grade}
            </div>
            <p className="text-[13px] text-stone-100 mt-3 leading-snug">{data.headline}</p>
            <div className="mt-2 text-[9px] uppercase tracking-[0.25em] text-[#5a5a62]">
              Confidence · {CONFIDENCE_LABEL[data.confidence]}
            </div>
          </div>
        </div>
      </section>

      {/* 차원별 점수 — Bar */}
      <section>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-3">
          By Axis
        </h3>
        <ul className="space-y-2.5">
          {data.axes.map((a) => (
            <li key={a.key} className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[11px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: a.color }}
                >
                  {a.label}
                </span>
                <span
                  className="font-mono text-[13px] font-bold"
                  style={{ color: a.color }}
                >
                  {a.score}
                  <span className="text-[10px] text-[#5a5a62] ml-0.5">/100</span>
                </span>
              </div>
              <div className="h-1.5 bg-[#0a0a0a] rounded overflow-hidden mb-2.5">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.max(2, Math.min(100, a.score))}%`,
                    backgroundColor: a.color,
                    boxShadow: a.score >= 70 ? `0 0 8px ${a.color}` : undefined,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0a0a0a] rounded p-2 border-l-2 border-[#5a5a62]">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#5a5a62] mb-1">
                    Reference
                  </div>
                  <div className="text-stone-100 leading-snug">{a.ref_note}</div>
                </div>
                <div className="bg-[#0a0a0a] rounded p-2 border-l-2" style={{ borderColor: a.color }}>
                  <div className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: a.color }}>
                    Mine
                  </div>
                  <div className="text-stone-100 leading-snug">{a.mine_note}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Win / Lose */}
      {(data.wins.length > 0 || data.losses.length > 0) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.wins.length > 0 && (
            <div className="bg-[#a3e635]/[0.06] border border-[#a3e635]/30 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] font-bold mb-2">
                ✓ Win
              </div>
              <ul className="space-y-1.5">
                {data.wins.map((w, i) => (
                  <li key={i} className="text-[12px] text-stone-100 leading-snug flex gap-2">
                    <span className="text-[#a3e635] shrink-0">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.losses.length > 0 && (
            <div className="bg-[#f97316]/[0.06] border border-[#f97316]/30 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#f97316] font-bold mb-2">
                ✗ Gap
              </div>
              <ul className="space-y-1.5">
                {data.losses.map((l, i) => (
                  <li key={i} className="text-[12px] text-stone-100 leading-snug flex gap-2">
                    <span className="text-[#f97316] shrink-0">·</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Cues — 다음 연습 액션 */}
      {data.cues.length > 0 && (
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] mb-3 font-bold">
            ▸ Next Practice Cues
          </h3>
          <ol className="space-y-2">
            {data.cues.map((c, i) => (
              <li
                key={i}
                className="bg-[#14141a] border border-[#a3e635]/40 rounded-lg p-3 flex gap-3"
              >
                <span className="font-mono text-[#a3e635] text-2xl font-bold leading-none shrink-0">
                  0{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-100 text-[14px] leading-snug">
                    {c.title}
                  </div>
                  <p className="text-[12px] text-[#888892] mt-1 leading-relaxed">
                    {c.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 한계·다음 촬영 팁 */}
      {(data.limitations?.length || data.next_recording_tips?.length) && (
        <section className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-3 text-[11px] space-y-3">
          {data.limitations && data.limitations.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#5a5a62] mb-1.5">
                Limitations
              </div>
              <ul className="space-y-1">
                {data.limitations.map((x, i) => (
                  <li key={i} className="text-[#888892] leading-snug">— {x}</li>
                ))}
              </ul>
            </div>
          )}
          {data.next_recording_tips && data.next_recording_tips.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#a3e635] mb-1.5">
                Next Recording Tips
              </div>
              <ul className="space-y-1">
                {data.next_recording_tips.map((x, i) => (
                  <li key={i} className="text-stone-100 leading-snug">→ {x}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
