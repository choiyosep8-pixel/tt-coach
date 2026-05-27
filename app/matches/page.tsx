import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { addMatch, deleteMatch } from './actions';
import type { OpponentType } from '@/lib/types';

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from('opponent_types')
    .select('id,slug,label,icon')
    .order('sort_order');

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, played_at, opponent_name, my_score, opp_score,
      worked, failed, notes, type_id,
      type:opponent_types(label,icon,slug)
    `)
    .order('played_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← 홈</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">매치 기록</h1>

      <form action={addMatch} className="border border-stone-200 bg-white rounded-lg p-4 space-y-2 mb-6">
        <h2 className="font-semibold text-sm">새 매치</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            name="played_at"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          />
          <input
            name="opponent_name"
            placeholder="상대 이름/별명"
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          />
        </div>
        <select
          name="type_id"
          required
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm bg-white"
        >
          <option value="">상대 유형 선택…</option>
          {((types ?? []) as Omit<OpponentType, 'description' | 'sort_order'>[]).map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="my_score"
            placeholder="내 점수"
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          />
          <input
            type="number"
            name="opp_score"
            placeholder="상대 점수"
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          />
        </div>
        <textarea
          name="worked"
          rows={2}
          placeholder="✅ 통한 전략"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <textarea
          name="failed"
          rows={2}
          placeholder="❌ 실패한 전략"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <textarea
          name="notes"
          rows={2}
          placeholder="📝 메모 (선택)"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
        >
          기록하기
        </button>
      </form>

      <h2 className="font-semibold text-sm mb-2">최근 기록 ({matches?.length ?? 0})</h2>
      <ul className="space-y-2">
        {(matches ?? []).map((m) => {
          const rawType = m.type as unknown;
          const type = (Array.isArray(rawType) ? rawType[0] : rawType) as
            | { label: string; icon: string | null; slug: string }
            | null;
          return (
            <li key={m.id} className="border border-stone-200 bg-white rounded p-3 text-sm">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <span>{m.played_at}</span>
                    {type && (
                      <Link href={`/types/${type.slug}`} className="text-emerald-700 hover:underline">
                        {type.icon} {type.label}
                      </Link>
                    )}
                  </div>
                  <div className="font-medium mt-1">
                    {m.opponent_name ?? '익명'}{' '}
                    <span className="text-stone-500">
                      {m.my_score ?? '-'} : {m.opp_score ?? '-'}
                    </span>
                  </div>
                  {m.worked && <p className="text-xs text-emerald-700 mt-1">✅ {m.worked}</p>}
                  {m.failed && <p className="text-xs text-red-700 mt-1">❌ {m.failed}</p>}
                  {m.notes && <p className="text-xs text-stone-600 mt-1 whitespace-pre-wrap">📝 {m.notes}</p>}
                </div>
                <form action={deleteMatch}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="text-xs text-stone-400 hover:text-red-600">삭제</button>
                </form>
              </div>
            </li>
          );
        })}
        {(matches ?? []).length === 0 && (
          <li className="text-xs text-stone-400 italic">아직 매치 기록이 없습니다. 위에서 첫 기록을 남겨보세요.</li>
        )}
      </ul>
    </div>
  );
}
