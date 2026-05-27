// "MM:SS" 또는 "HH:MM:SS" 또는 빈 → 초 단위로 변환
export function parseTimeToSec(raw: string | null | undefined): number | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const parts = s.split(':').map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  let sec = 0;
  if (parts.length === 1) sec = parts[0];
  else if (parts.length === 2) sec = parts[0] * 60 + parts[1];
  else if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else return null;
  return Math.max(0, Math.floor(sec));
}

export function formatSec(total: number | null | undefined): string {
  if (total == null || !Number.isFinite(total)) return '';
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
