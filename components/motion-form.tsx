'use client';
import { createAnalysis } from '@/app/motion/actions';
import { SubmitButton } from './submit-button';

export function MotionForm() {
  return (
    <form action={createAnalysis} className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-5 space-y-4">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">+ New Analysis</h2>

      <input
        name="title"
        required
        maxLength={120}
        placeholder="분석 제목 (예: 백핸드 푸시 비교)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#888892] block mb-1.5">
            Reference — 롤모델 유튜브 URL
          </label>
          <input
            name="reference_url"
            type="url"
            required
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] block mb-1.5">
            Mine — 내 유튜브 URL
          </label>
          <input
            name="my_video_url"
            type="url"
            required
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
          />
        </div>
      </div>

      <textarea
        name="focus"
        rows={3}
        placeholder="분석 포인트 (예: 팔꿈치 각도와 체중 이동을 비교해서 차이 알려줘)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <SubmitButton
        label="분석 요청"
        pendingLabel="요청 중…"
        savedLabel="요청 보냈습니다"
        fullWidth
      />

      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] text-center">
        Both videos must be on YouTube. CLI will fetch &amp; compare.
      </p>
    </form>
  );
}
