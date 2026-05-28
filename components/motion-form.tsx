'use client';
import { useState } from 'react';
import { createAnalysis } from '@/app/motion/actions';
import { SubmitButton } from './submit-button';
import { SubjectFieldset } from './subject-fieldset';
import { VideoUploader } from './video-uploader';

type MineMode = 'youtube' | 'upload';
type AnalysisMode = 'vs_reference' | 'vs_criteria';

export function MotionForm({ userId }: { userId: string }) {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('vs_reference');
  const [mineMode, setMineMode] = useState<MineMode>('upload');

  return (
    <form
      action={createAnalysis}
      className="bg-[#14141a] border border-[#2a2a30] rounded-xl p-4 sm:p-5 space-y-4 min-w-0"
    >
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">+ New Analysis</h2>

      <input
        name="title"
        required
        maxLength={120}
        placeholder="분석 제목 (예: 백핸드 푸시 비교)"
        className="w-full min-w-0 px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      {/* 분석 모드 토글 — 롤모델 vs 코치 요구사항 */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-1.5">
          분석 모드
        </div>
        <div className="flex gap-1 p-0.5 bg-[#0a0a0a] border border-[#2a2a30] rounded">
          <button
            type="button"
            onClick={() => setAnalysisMode('vs_reference')}
            className={`flex-1 py-2 rounded text-[11px] uppercase tracking-[0.15em] font-bold transition ${
              analysisMode === 'vs_reference'
                ? 'bg-[#a3e635] text-[#0a0a0a]'
                : 'text-[#888892] hover:text-stone-100'
            }`}
          >
            Vs 롤모델
          </button>
          <button
            type="button"
            onClick={() => setAnalysisMode('vs_criteria')}
            className={`flex-1 py-2 rounded text-[11px] uppercase tracking-[0.15em] font-bold transition ${
              analysisMode === 'vs_criteria'
                ? 'bg-[#a3e635] text-[#0a0a0a]'
                : 'text-[#888892] hover:text-stone-100'
            }`}
          >
            Vs 코치 요구사항
          </button>
        </div>
        <input type="hidden" name="analysis_mode" value={analysisMode} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 min-w-0">
        {/* Left: Reference URL OR Criteria 텍스트 */}
        <fieldset className="space-y-3 border border-[#2a2a30] rounded-lg p-3 min-w-0">
          {analysisMode === 'vs_reference' ? (
            <>
              <legend className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#888892]">
                Reference · 닮고 싶은
              </legend>
              <input
                name="reference_url"
                type="url"
                required
                placeholder="https://youtu.be/..."
                className="w-full min-w-0 px-3 py-2 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
              />
              <SubjectFieldset prefix="reference" variant="reference" />
            </>
          ) : (
            <>
              <legend className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#38bdf8]">
                Criteria · 코치 요구사항
              </legend>
              <textarea
                name="criteria"
                required
                rows={8}
                placeholder={'예시:\n1. 무릎을 굽혀 자세 낮추기\n2. 왼팔 수평으로 펴서 균형\n3. 오른발 한 발 디딘 후 임팩트\n4. 라켓이 테이블 모서리 높이까지 내려옴\n5. 임팩트 순간 손목 잠금'}
                className="w-full min-w-0 px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#38bdf8] leading-relaxed font-mono"
              />
              <p className="text-[10px] text-[#5a5a62] leading-relaxed px-1">
                항목별로 줄바꿈 — 분석 결과에서 항목별 만족도 점수가 매겨집니다.
              </p>
            </>
          )}
        </fieldset>

        {/* Right: Mine — 유튜브 OR 파일 업로드 토글 (항상 동일) */}
        <fieldset className="space-y-3 border border-[#a3e635]/40 rounded-lg p-3 bg-[#a3e635]/[0.02] min-w-0">
          <legend className="px-2 text-[10px] uppercase tracking-[0.25em] text-[#a3e635]">
            Mine · 나
          </legend>

          <div className="flex gap-1 p-0.5 bg-[#0a0a0a] border border-[#2a2a30] rounded">
            <button
              type="button"
              onClick={() => setMineMode('upload')}
              className={`flex-1 py-1.5 rounded text-[10px] uppercase tracking-[0.15em] font-bold transition ${
                mineMode === 'upload'
                  ? 'bg-[#a3e635] text-[#0a0a0a]'
                  : 'text-[#888892] hover:text-stone-100'
              }`}
            >
              파일 업로드
            </button>
            <button
              type="button"
              onClick={() => setMineMode('youtube')}
              className={`flex-1 py-1.5 rounded text-[10px] uppercase tracking-[0.15em] font-bold transition ${
                mineMode === 'youtube'
                  ? 'bg-[#a3e635] text-[#0a0a0a]'
                  : 'text-[#888892] hover:text-stone-100'
              }`}
            >
              유튜브 URL
            </button>
          </div>

          <input type="hidden" name="my_mode" value={mineMode} />

          {mineMode === 'youtube' ? (
            <input
              name="my_video_url"
              type="url"
              placeholder="https://youtu.be/..."
              className="w-full min-w-0 px-3 py-2 bg-[#0a0a0a] border border-[#2a2a30] rounded text-[12px] text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
            />
          ) : (
            <VideoUploader userId={userId} />
          )}

          <SubjectFieldset prefix="my" variant="mine" required />
        </fieldset>
      </div>

      <textarea
        name="focus"
        rows={3}
        placeholder="추가 분석 포인트 (선택)"
        className="w-full min-w-0 px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
      />

      <SubmitButton
        label="분석 요청"
        pendingLabel="요청 중…"
        savedLabel="요청 보냈습니다"
        fullWidth
      />

      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] text-center leading-relaxed">
        {analysisMode === 'vs_reference'
          ? '롤모델 영상과 직접 비교 분석'
          : '코치 요구사항 체크리스트별 수행도 분석'}
      </p>
    </form>
  );
}
