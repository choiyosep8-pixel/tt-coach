'use client';
import { createAnalysis } from '@/app/motion/actions';
import { SubmitButton } from './submit-button';
import { SubjectFieldset } from './subject-fieldset';

export function MotionForm() {
  return (
    <form action={createAnalysis} className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-5 space-y-5">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">+ New Analysis</h2>

      <input
        name="title"
        required
        maxLength={120}
        placeholder="분석 제목 (예: 백핸드 푸시 비교)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Reference */}
        <fieldset className="space-y-3 border border-[#2a2a30] rounded-lg p-4">
          <legend className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#888892]">
            Reference · 닮고 싶은 사람
          </legend>
          <input
            name="reference_url"
            type="url"
            required
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
          />
          <SubjectFieldset prefix="reference" variant="reference" />
        </fieldset>

        {/* Mine */}
        <fieldset className="space-y-3 border border-[#a3e635]/40 rounded-lg p-4 bg-[#a3e635]/[0.02]">
          <legend className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#a3e635]">
            Mine · 나
          </legend>
          <input
            name="my_video_url"
            type="url"
            required
            placeholder="https://youtu.be/..."
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
          />
          <SubjectFieldset prefix="my" variant="mine" required />
        </fieldset>
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

      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] text-center leading-relaxed">
        탁구는 둘이 치니까 — 본인 위치·그립·구간을 정확히 박을수록 분석 정확도 ↑
      </p>
    </form>
  );
}
