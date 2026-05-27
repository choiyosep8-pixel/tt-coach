export type SessionKind = 'lesson' | 'solo' | 'partner' | 'game' | 'tournament';

export const SESSION_KINDS: Array<{
  value: SessionKind;
  label: string;
  code: string;
  color: string;
}> = [
  { value: 'lesson',     label: '레슨',         code: 'LESSON',   color: '#a3e635' },
  { value: 'solo',       label: '개인 운동',     code: 'SOLO',     color: '#38bdf8' },
  { value: 'partner',    label: '파트너 연습',   code: 'PARTNER',  color: '#a78bfa' },
  { value: 'game',       label: '게임',         code: 'GAME',     color: '#f97316' },
  { value: 'tournament', label: '대회',         code: 'TOURNEY',  color: '#facc15' },
];

export const KIND_BY_VALUE: Record<SessionKind, typeof SESSION_KINDS[number]> =
  SESSION_KINDS.reduce(
    (acc, k) => { acc[k.value] = k; return acc; },
    {} as Record<SessionKind, typeof SESSION_KINDS[number]>
  );
