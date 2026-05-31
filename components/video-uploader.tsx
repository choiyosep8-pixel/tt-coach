'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { compressVideo, type CompressProgress } from '@/lib/video-compress';

type UploadedVideo = { path: string; name: string; size: number; compressedFrom?: number };

const SUPABASE_LIMIT_BYTES = 50 * 1024 * 1024;
const COMPRESS_THRESHOLD_BYTES = 45 * 1024 * 1024; // 45MB 이상이면 압축 (안전 마진)

function fmtMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function VideoUploader({ userId }: { userId: string }) {
  const [items, setItems] = useState<UploadedVideo[]>([]);
  const [busyText, setBusyText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const supabase = createClient();
    const draftId = crypto.randomUUID();

    for (const original of Array.from(files)) {
      let file: File = original;
      const originalSize = original.size;

      try {
        // 압축 필요 여부
        if (original.size > COMPRESS_THRESHOLD_BYTES) {
          setBusyText(`압축 준비 중… (${fmtMB(original.size)})`);
          file = await compressVideo(original, (p: CompressProgress) => {
            if (p.phase === 'loading') setBusyText('압축 엔진 로딩 중…');
            else if (p.phase === 'reading') setBusyText('영상 읽는 중…');
            else if (p.phase === 'encoding')
              setBusyText(`720p 변환 중… ${Math.round(p.ratio * 100)}%`);
          });
          setBusyText(`압축 완료 ${fmtMB(originalSize)} → ${fmtMB(file.size)}`);
        }

        // 압축 후에도 50MB 초과면 실패
        if (file.size > SUPABASE_LIMIT_BYTES) {
          setError(
            `압축 후에도 ${fmtMB(file.size)} > 50MB. 영상을 30초 이하로 잘라서 다시 시도해주세요`
          );
          setBusyText(null);
          continue;
        }

        setBusyText(`업로드 중… ${fmtMB(file.size)}`);
        const path = `${userId}/${draftId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
        const { error: upErr } = await supabase.storage
          .from('session-videos')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          setError(upErr.message);
          setBusyText(null);
          return;
        }
        setItems((prev) => [
          ...prev,
          {
            path,
            name: file.name,
            size: file.size,
            compressedFrom: file.size !== originalSize ? originalSize : undefined,
          },
        ]);
        setBusyText(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setBusyText(null);
      }
    }
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
          Video Upload — 자동 720p 압축
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          disabled={!!busyText}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="mt-1.5 w-full text-[12px] text-[#888892] file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-[#0a0a0a] file:border file:border-[#2a2a30] file:text-[#a3e635] file:font-bold file:uppercase file:tracking-[0.15em] file:text-[10px] file:cursor-pointer hover:file:border-[#a3e635]/40 disabled:opacity-50 disabled:cursor-wait"
        />
      </label>

      {busyText && (
        <div className="text-[11px] text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/30 rounded px-2.5 py-1.5 leading-relaxed animate-pulse">
          ▸ {busyText}
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
                <span className="text-[#5a5a62]">
                  ({fmtMB(i.size)}
                  {i.compressedFrom ? ` · 원본 ${fmtMB(i.compressedFrom)}` : ''})
                </span>
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

      <p className="text-[10px] text-[#5a5a62] leading-relaxed">
        45MB 넘는 영상은 자동으로 720p / H.264 / 무음으로 변환 후 업로드합니다.
        첫 사용 시 압축 엔진 5MB 다운로드(한 번만).
      </p>
    </div>
  );
}
