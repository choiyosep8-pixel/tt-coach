'use client';
import { useState, useTransition } from 'react';
import { saveMastery } from '@/app/types/[slug]/mastery-actions';

export function MasteryEditor({
  typeId,
  slug,
  initialPct,
  initialPartners,
}: {
  typeId: string;
  slug: string;
  initialPct: number;
  initialPartners: string[];
}) {
  const [pct, setPct] = useState(initialPct);
  const [partnersText, setPartnersText] = useState(initialPartners.join(', '));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const mastered = pct >= 100;
  const fillColor = pct >= 70 ? '#a3e635' : pct >= 30 ? '#84cc16' : '#5a5a62';

  function save() {
    const fd = new FormData();
    fd.set('type_id', typeId);
    fd.set('slug', slug);
    fd.set('mastery_percent', String(pct));
    fd.set('partners', partnersText);
    startTransition(async () => {
      await saveMastery(fd);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt((v) => (v && Date.now() - v >= 1500 ? null : v)), 1600);
    });
  }

  return (
    <div className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-5 space-y-5 mb-6 relative overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#a3e635]/[0.08] to-transparent pointer-events-none"
        style={{ height: `${pct}%` }}
        aria-hidden
      />
      <div className="relative space-y-5">
        {/* 마스터율 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">
              Mastery
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: fillColor }}>
              {pct}%
              {mastered && (
                <span className="ml-2 text-[10px] tracking-[0.3em] align-middle">MASTER</span>
              )}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full accent-[#a3e635]"
            style={{ accentColor: '#a3e635' }}
          />
          <div className="h-1.5 bg-[#0a0a0a] rounded overflow-hidden mt-2">
            <div
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: fillColor,
                boxShadow: pct >= 70 ? '0 0 10px #a3e635' : undefined,
              }}
            />
          </div>
        </div>

        {/* 지인 */}
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#888892] block mb-1.5">
            Sparring Partners — 이 유형에 해당하는 지인
          </label>
          <input
            value={partnersText}
            onChange={(e) => setPartnersText(e.target.value)}
            placeholder="김ㅇㅇ, 이ㅇㅇ, 박ㅇㅇ"
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
          />
          <p className="text-[10px] text-[#5a5a62] mt-1.5 tracking-wide">
            쉼표로 구분 · 시뮬레이션용 시드
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={save}
            disabled={pending}
            className="px-6 py-2.5 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-lime-300 disabled:opacity-60 disabled:cursor-wait transition inline-flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                저장 중…
              </>
            ) : (
              '마스터율 저장'
            )}
          </button>
          <span
            className={`text-[11px] uppercase tracking-[0.2em] text-[#a3e635] transition-opacity duration-200 ${
              savedAt ? 'opacity-100' : 'opacity-0'
            }`}
            aria-live="polite"
          >
            ✓ 저장했습니다
          </span>
        </div>
      </div>
    </div>
  );
}
