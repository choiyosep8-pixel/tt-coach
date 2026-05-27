import type { MotionStatus } from '@/lib/types';

const META: Record<MotionStatus, { label: string; color: string; bg: string; pulse: boolean }> = {
  pending:    { label: 'Pending',    color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)',   pulse: false },
  processing: { label: 'Processing', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)',   pulse: true },
  done:       { label: 'Done',       color: '#a3e635', bg: 'rgba(163, 230, 53, 0.12)',  pulse: false },
  failed:     { label: 'Failed',     color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)',   pulse: false },
};

export function MotionStatusBadge({ status }: { status: MotionStatus }) {
  const m = META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-[0.2em] ${m.pulse ? 'animate-pulse' : ''}`}
      style={{ color: m.color, backgroundColor: m.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}
