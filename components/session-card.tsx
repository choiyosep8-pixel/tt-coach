import Link from 'next/link';
import { KIND_BY_VALUE } from '@/lib/session-kinds';
import { deleteSession } from '@/app/sessions/actions';
import { typeCode } from '@/lib/type-codes';
import type { Session } from '@/lib/types';

type RawType = { label: string; icon: string | null; slug: string };
type Row = Session & { type: RawType | RawType[] | null };

export function SessionCard({ session: s }: { session: Row }) {
  const meta = KIND_BY_VALUE[s.kind];
  const rawType = s.type;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  const score =
    s.my_score != null && s.opp_score != null ? `${s.my_score} : ${s.opp_score}` : null;

  return (
    <li
      className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-4 border-l-4"
      style={{ borderLeftColor: meta.color }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span style={{ color: meta.color }} className="font-bold">
              {meta.code}
            </span>
            <span className="text-[#5a5a62]">·</span>
            <span className="font-mono text-[#888892]">{s.session_date}</span>
            {type && (
              <>
                <span className="text-[#5a5a62]">·</span>
                <Link
                  href={`/types/${type.slug}`}
                  className="text-[#a3e635] hover:underline font-mono"
                >
                  {typeCode(type.slug)}
                </Link>
              </>
            )}
          </div>
          {s.title && <div className="font-semibold text-stone-100 mt-2">{s.title}</div>}
          {(s.opponent_name || score) && (
            <div className="text-sm text-stone-100 mt-1">
              {s.opponent_name ?? '익명'}{' '}
              {score && <span className="text-[#888892] font-mono">· {score}</span>}
            </div>
          )}
          {s.worked && (
            <div className="text-[12px] text-[#a3e635] mt-2 leading-relaxed flex gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] mt-0.5 shrink-0">
                Win
              </span>
              <span>{s.worked}</span>
            </div>
          )}
          {s.failed && (
            <div className="text-[12px] text-[#f97316] mt-1 leading-relaxed flex gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] mt-0.5 shrink-0">
                Lose
              </span>
              <span>{s.failed}</span>
            </div>
          )}
          {s.notes && (
            <p className="text-[12px] text-[#888892] mt-2 whitespace-pre-wrap leading-relaxed">
              {s.notes}
            </p>
          )}
          {s.feedback && (
            <div className="mt-3 border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#a3e635] mb-1.5">
                Feedback
              </div>
              <p className="text-[12px] text-stone-100 whitespace-pre-wrap leading-relaxed">
                {s.feedback}
              </p>
            </div>
          )}
          {s.video_paths && s.video_paths.length > 0 && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#888892] mt-2">
              Video × {s.video_paths.length}
            </div>
          )}
          {s.reference_url && (
            <a
              href={s.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.2em] text-[#a3e635] hover:underline mt-1 inline-block"
            >
              ↗ Reference
            </a>
          )}
        </div>
        <form action={deleteSession}>
          <input type="hidden" name="id" value={s.id} />
          <button className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] hover:text-[#f97316]">
            Del
          </button>
        </form>
      </div>
    </li>
  );
}
