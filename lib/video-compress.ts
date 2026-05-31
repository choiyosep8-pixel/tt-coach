'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

// single-thread core — SharedArrayBuffer 불필요 (모든 브라우저 호환)
const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const inst = new FFmpeg();
    await inst.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpeg = inst;
    return inst;
  })();
  return loadingPromise;
}

export type CompressProgress = {
  phase: 'loading' | 'reading' | 'encoding' | 'done';
  ratio: number; // 0~1
};

export async function compressVideo(
  file: File,
  onProgress?: (p: CompressProgress) => void
): Promise<File> {
  onProgress?.({ phase: 'loading', ratio: 0 });
  const ff = await getFFmpeg();

  onProgress?.({ phase: 'reading', ratio: 0 });
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `in.${ext}`;
  const outputName = 'out.mp4';

  await ff.writeFile(inputName, await fetchFile(file));

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.({ phase: 'encoding', ratio: Math.max(0, Math.min(1, progress)) });
  };
  ff.on('progress', progressHandler);

  try {
    await ff.exec([
      '-i', inputName,
      '-vf', 'scale=540:-2,fps=24',    // 540p + 24fps (분석엔 충분, 변환 ~2배 빠름)
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'fastdecode',
      '-crf', '30',                    // 약간 더 압축 (화질엔 거의 차이 없음)
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
      '-y',
      outputName,
    ]);
  } finally {
    ff.off('progress', progressHandler);
  }

  const data = await ff.readFile(outputName);
  // 메모리 정리
  try {
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);
  } catch {
    /* ignore */
  }

  onProgress?.({ phase: 'done', ratio: 1 });

  const blob = new Blob([data as Uint8Array<ArrayBuffer>], { type: 'video/mp4' });
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}-720p.mp4`, { type: 'video/mp4' });
}
