'use client';
import { useState } from 'react';
import { SESSION_KINDS, type SessionKind } from '@/lib/session-kinds';
import { VideoUploader } from './video-uploader';
import { SubmitButton } from './submit-button';
import { addSession } from '@/app/sessions/actions';

type OpponentTypeOpt = { id: string; slug: string; label: string };

export function SessionForm({
  userId,
  opponentTypes,
  defaultDate,
}: {
  userId: string;
  opponentTypes: OpponentTypeOpt[];
  defaultDate?: string;
}) {
  const [kind, setKind] = useState<SessionKind>('lesson');
  const showOpponentFields = kind === 'game' || kind === 'tournament';

  return (
    <form action={addSession} className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-5 space-y-3.5">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">+ New Session</h2>

      {/* 카테고리 5개 — pill */}
      <div className="grid grid-cols-5 gap-1.5">
        {SESSION_KINDS.map((k) => (
          <button
            type="button"
            key={k.value}
            onClick={() => setKind(k.value)}
            className={`py-2.5 rounded text-[10px] font-bold uppercase tracking-[0.1em] transition ${
              kind === k.value
                ? 'bg-[#a3e635] text-[#0a0a0a]'
                : 'bg-[#0a0a0a] border border-[#2a2a30] text-[#888892] hover:text-stone-100 hover:border-[#a3e635]/40'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="kind" value={kind} />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="session_date"
          defaultValue={defaultDate ?? new Date().toISOString().slice(0, 10)}
          className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 focus:outline-none focus:border-[#a3e635]"
        />
        <input
          name="title"
          placeholder="제목 (예: 푸시 교정)"
          className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
      </div>

      {showOpponentFields && (
        <div className="space-y-2 border-l-2 border-[#a3e635]/40 pl-3 ml-1">
          <select
            name="opponent_type_id"
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 focus:outline-none focus:border-[#a3e635]"
          >
            <option value="">상대 유형 선택…</option>
            {opponentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input
              name="opponent_name"
              placeholder="상대 이름"
              className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
            />
            <input
              type="number"
              name="my_score"
              placeholder="내 점수"
              className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
            />
            <input
              type="number"
              name="opp_score"
              placeholder="상대 점수"
              className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <textarea
          name="worked"
          rows={2}
          placeholder={showOpponentFields ? '통한 전략' : '잘된 점'}
          className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
        <textarea
          name="failed"
          rows={2}
          placeholder={showOpponentFields ? '실패한 전략' : '아쉬운 점'}
          className="px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
      </div>

      <VideoUploader userId={userId} />
      <input
        name="reference_url"
        type="url"
        placeholder="https:// 롤모델 유튜브 URL (선택)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <textarea
        name="feedback"
        rows={3}
        placeholder="피드백 (코치·AI·본인 분석 결과 붙여넣기)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />
      <textarea
        name="notes"
        rows={2}
        placeholder="자유 메모"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <SubmitButton label="세션 기록" pendingLabel="기록 중…" savedLabel="기록했습니다" fullWidth />
    </form>
  );
}
