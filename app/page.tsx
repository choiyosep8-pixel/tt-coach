import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { OpponentType } from '@/lib/types';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: types } = await supabase
    .from('opponent_types')
    .select('*')
    .order('sort_order');

  const { data: counts } = await supabase
    .from('counter_strategies')
    .select('type_id');

  const countByType = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.type_id] = (acc[r.type_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">상대 유형별 파훼법</h1>
        <p className="text-sm text-stone-600 mt-1">
          안녕하세요, <b>{user?.user_metadata?.display_name ?? user?.email}</b>님.
          오늘 만난 상대는 어떤 유형이었나요?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {((types ?? []) as OpponentType[]).map((t) => (
          <Link
            key={t.id}
            href={`/types/${t.slug}`}
            className="block border border-stone-200 rounded-lg p-4 bg-white hover:border-emerald-500 hover:shadow-sm transition"
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-semibold">{t.label}</div>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{t.description}</p>
            <div className="text-xs text-emerald-700 mt-2">
              내 노트 {countByType[t.id] ?? 0}개
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/matches"
          className="inline-block px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700 text-sm"
        >
          📝 오늘 매치 기록하기
        </Link>
      </div>
    </div>
  );
}
