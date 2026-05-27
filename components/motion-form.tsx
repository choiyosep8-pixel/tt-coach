'use client';
import { VideoUploader } from './video-uploader';
import { createAnalysis } from '@/app/motion/actions';

export function MotionForm({ userId }: { userId: string }) {
  return (
    <form action={createAnalysis} className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-5 space-y-3.5">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">+ New Analysis</h2>

      <input
        name="title"
        required
        maxLength={120}
        placeholder="분석 제목 (예: 백핸드 푸시 비교)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-[#888892] block mb-1.5">
          Reference — 유튜브 URL
        </label>
        <input
          name="reference_url"
          type="url"
          placeholder="https://youtu.be/..."
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
      </div>

      <div className="border-l-2 border-[#a3e635]/40 pl-3 ml-1">
        <label className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] block mb-1.5">
          My Video — 내 스윙 업로드
        </label>
        <VideoUploader userId={userId} />
      </div>

      <textarea
        name="focus"
        rows={3}
        placeholder="분석 포인트 (예: 팔꿈치 각도와 체중 이동을 비교해서 차이 알려줘)"
        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <button
        type="submit"
        className="w-full py-3 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-lime-300 transition"
      >
        Request Analysis
      </button>
    </form>
  );
}
