// 8 상대 유형 → 짧은 영문 코드 (이모지 X, 디자인 톤)
export const TYPE_CODE: Record<string, string> = {
  short: 'SHORT',
  long: 'LONG',
  'young-elite': 'YOUNG',
  'penhold-unconv': 'PNHLD',
  lefty: 'LEFTY',
  'power-drive': 'POWER',
  lob: 'LOB',
  knuckle: 'KNCKL',
};

export function typeCode(slug: string): string {
  return TYPE_CODE[slug] ?? slug.toUpperCase().slice(0, 5);
}

export function typeNumber(slug: string, sortOrder: number): string {
  return String(sortOrder).padStart(2, '0');
}
