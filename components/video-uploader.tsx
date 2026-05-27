'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type UploadedVideo = { path: string; name: string; size: number };

export function VideoUploader({ userId }: { userId: string }) {
  const [items, setItems] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const supabase = createClient();
    const draftId = crypto.randomUUID();

    for (const file of Array.from(files)) {
      if (file.size > 100 * 1024 * 1024) {
        setError(`${file.name}: 100MB 초과`);
        continue;
      }
      setUploading(true);
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
          Video Upload — ≤100MB
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
          Uploading…
        </div>
      )}
      {error && <div className="text-[11px] text-[#f97316]">{error}</div>}
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
                <span className="text-[#5a5a62]">({(i.size / 1024 / 1024).toFixed(1)}MB)</span>
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
    </div>
  );
}
