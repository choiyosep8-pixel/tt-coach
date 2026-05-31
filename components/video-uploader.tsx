'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type UploadedVideo = { path: string; name: string; size: number };

// Supabase Free tier per-file standard upload 한도
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_LABEL = '50MB';

export function VideoUploader({ userId }: { userId: string }) {
  const [items, setItems] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fmtMB(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  async function handleFiles(files: FileList) {
    setError(null);
    const supabase = createClient();
    const draftId = crypto.randomUUID();

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(
          `${file.name} (${fmtMB(file.size)}) — Supabase Free 한도 ${MAX_LABEL} 초과. 아래 가이드 참고`
        );
        continue;
      }
      setUploading(true);
      setProgress(0);
      const path = `${userId}/${draftId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error: upErr } = await supabase.storage
        .from('session-videos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError(upErr.message);
        setUploading(false);
        return;
      }
      setItems((prev) => [...prev, { path, name: file.name, size: file.size }]);
      setProgress(100);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function remove(path: string) {
    const supabase = createClient();
    await supabase.storage.from('session-videos').remove([path]);
    setItems((prev) => prev.filter((i) => i.path !== path));
  }

  const value = items.map((i) => i.path).join(',');

  return (
    <div className="space-y-2">
      <input type="hidden" name="video_paths" value={value} />
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#888892]">
          Video Upload — ≤{MAX_LABEL}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="mt-1.5 w-full text-[12px] text-[#888892] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#0a0a0a] file:border file:border-[#2a2a30] file:text-[#a3e635] file:font-bold file:uppercase file:tracking-[0.15em] file:text-[10px] file:cursor-pointer hover:file:border-[#a3e635]/40"
        />
      </label>

      {uploading && (
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#a3e635] animate-pulse">
          Uploading… {progress}%
        </div>
      )}

      {error && (
        <div className="text-[11px] text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/30 rounded p-2 leading-relaxed">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((i) => (
            <li
              key={i.path}
              className="flex items-center justify-between bg-[#0a0a0a] border border-[#2a2a30] rounded px-3 py-2 text-[12px]"
            >
              <span className="text-stone-100 truncate flex-1 mr-2">
                <span className="text-[#a3e635] mr-1">●</span>
                {i.name}{' '}
                <span className="text-[#5a5a62]">({fmtMB(i.size)})</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i.path)}
                className="text-[#5a5a62] hover:text-[#f97316] text-[10px] uppercase tracking-[0.15em]"
              >
                Del
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 가이드 — 50MB 안 넘기는 법 */}
      <details className="text-[11px] text-[#888892]">
        <summary className="cursor-pointer text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] hover:text-stone-100 select-none">
          ▾ {MAX_LABEL} 안 들어가요? — 가이드
        </summary>
        <div className="mt-2 space-y-1.5 pl-2 border-l border-[#2a2a30] leading-relaxed">
          <p>
            <span className="text-[#a3e635] font-bold">iPhone</span> · 카메라 설정 →
            *비디오 녹화* → <b>720p HD 30fps</b> (4K → 720p)
          </p>
          <p>
            <span className="text-[#a3e635] font-bold">Android</span> · 카메라 →
            해상도 → <b>HD (720p)</b>
          </p>
          <p>
            <span className="text-[#a3e635] font-bold">길이</span> · <b>30초 이하</b>
            로 잘라서 (분석엔 한 동작이면 충분)
          </p>
          <p className="text-[10px] text-[#5a5a62]">
            720p · 30fps · 30초 ≈ 10~15MB
          </p>
        </div>
      </details>
    </div>
  );
}
