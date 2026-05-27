import { KIND_BY_VALUE, type SessionKind } from './session-kinds';

export const KIND_EMOJI: Record<SessionKind, string> = {
  lesson: '🎓',
  solo: '🏋️',
  partner: '🤝',
  game: '⚔️',
  tournament: '🏆',
};

export function sessionSummary(s: {
  kind: SessionKind;
  title: string | null;
  worked: string | null;
  opponent_name: string | null;
  my_score: number | null;
  opp_score: number | null;
}): string {
  const kindLabel = KIND_BY_VALUE[s.kind].label;
  if (s.title?.trim()) return `${kindLabel}: ${s.title.trim()}`;
  if (s.opponent_name) {
    const score =
      s.my_score != null && s.opp_score != null ? ` ${s.my_score}:${s.opp_score}` : '';
    return `${kindLabel} vs ${s.opponent_name}${score}`;
  }
  if (s.worked) return `${kindLabel}: ${s.worked.split('\n')[0].slice(0, 30)}`;
  return kindLabel;
}

export function dominantKind(rows: Array<{ kind: SessionKind }>): SessionKind | null {
  if (rows.length === 0) return null;
  const counts: Partial<Record<SessionKind, number>> = {};
  rows.forEach((r) => {
    counts[r.kind] = (counts[r.kind] ?? 0) + 1;
  });
  let best: SessionKind = rows[0].kind;
  let bestN = 0;
  for (const [k, n] of Object.entries(counts) as Array<[SessionKind, number]>) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}
