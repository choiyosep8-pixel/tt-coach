'use client';
import { useState } from 'react';

const POSITIONS: Array<{ value: string; label: string }> = [
  { value: 'solo',  label: '단독' },
  { value: 'left',  label: '왼쪽' },
  { value: 'right', label: '오른쪽' },
  { value: 'near',  label: '카메라쪽' },
  { value: 'far',   label: '반대편' },
];
const HANDS: Array<{ value: string; label: string }> = [
  { value: 'right', label: '오른손' },
  { value: 'left',  label: '왼손' },
];

export function SubjectFieldset({
  prefix,
  variant,
  defaultSubject,
  defaultPosition,
  defaultHand,
  defaultStart,
  defaultEnd,
  required,
}: {
  prefix: 'reference' | 'my';
  variant: 'reference' | 'mine';
  defaultSubject?: string;
  defaultPosition?: string;
  defaultHand?: string;
  defaultStart?: string;
  defaultEnd?: string;
  required?: boolean;
}) {
  const [position, setPosition] = useState(defaultPosition ?? '');
  const [hand, setHand] = useState(defaultHand ?? '');

  const subjectName = `${prefix}_subject`;
  const positionName = `${prefix}_position`;
  const handName = `${prefix}_hand`;
  const startName = `${prefix}_start`;
  const endName = `${prefix}_end`;

  const subjectPlaceholder =
    variant === 'mine'
      ? '예: 파란 상하의, 무릎 보호대 X'
      : '예: 검은 티 (단독이면 비움)';

  return (
    <div className="space-y-2.5 min-w-0">
      {/* Position chips */}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.25em] text-[#5a5a62] mb-1.5">
          위치
        </div>
        <div className="flex flex-wrap gap-1">
          {POSITIONS.map((p) => {
            const active = position === p.value;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => setPosition(active ? '' : p.value)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                  active
                    ? 'bg-[#a3e635] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] border border-[#2a2a30] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name={positionName} value={position} />
      </div>

      {/* Hand chips */}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.25em] text-[#5a5a62] mb-1.5">
          그립
        </div>
        <div className="flex gap-1">
          {HANDS.map((h) => {
            const active = hand === h.value;
            return (
              <button
                type="button"
                key={h.value}
                onClick={() => setHand(active ? '' : h.value)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                  active
                    ? 'bg-[#a3e635] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] border border-[#2a2a30] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40'
                }`}
              >
                {h.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name={handName} value={hand} />
      </div>

      {/* Subject 자유 텍스트 */}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.25em] text-[#5a5a62] mb-1.5">
          특징
        </div>
        <input
          name={subjectName}
          defaultValue={defaultSubject ?? ''}
          required={required}
          maxLength={140}
          placeholder={subjectPlaceholder}
          className="w-full min-w-0 px-3 py-2 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
      </div>

      {/* 타임스탬프 — 폰에서 깨지지 않게 min-w-0 + shrink-0 */}
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.25em] text-[#5a5a62] mb-1.5">
          구간 <span className="text-[#5a5a62] normal-case tracking-normal">MM:SS · 선택</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <input
            name={startName}
            defaultValue={defaultStart ?? ''}
            placeholder="시작"
            className="flex-1 min-w-0 px-2.5 py-2 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] font-mono"
          />
          <span className="text-[#5a5a62] text-[10px] shrink-0">→</span>
          <input
            name={endName}
            defaultValue={defaultEnd ?? ''}
            placeholder="끝"
            className="flex-1 min-w-0 px-2.5 py-2 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] font-mono"
          />
        </div>
      </div>
    </div>
  );
}
