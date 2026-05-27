import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addStrategy, deleteStrategy } from './actions';
import { CoachButton } from './coach-button';

const KIND_LABEL: Record<string, string> = {
  strategy: '✅ 파훼법',
  failure: '❌ 자주 실패',
  note: '📝 메모',
};
const KIND_ORDER = ['strategy', 'failure', 'note'];

export default async function TypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: type } = await supabase
    .from('opponent_types')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!type) notFound();

  const { data: strategies } = await supabase
    .from('counter_strategies')
    .select('*')
    .eq('type_id', type.id)
    .order('kind')
    .order('created_at', { ascending: false });

  const grouped: Record<string, typeof strategies extends (infer T)[] | null ? T[] : never> =
    { strategy: [], failure: [], note: [] };
  (strategies ?? []).forEach((s) => {
    grouped[s.kind]?.push(s);
  });

  return (
    <div>
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← 유형 목록</Link>
      <div className="mt-3 mb-6">
        <div className="text-4xl">{type.icon}</div>
        <h1 className="text-2xl font-bold mt-2">{type.label}</h1>
        <p className="text-sm text-stone-600 mt-1">{type.description}</p>
      </div>

      {process.env.ANTHROPIC_API_KEY && (
        <CoachButton typeSlug={type.slug} typeLabel={type.label} />
      )}

      {KIND_ORDER.map((kind) => (
        <section key={kind} className="mt-6">
          <h2 className="font-semibold text-sm mb-2">
            {KIND_LABEL[kind]} ({grouped[kind].length})
          </h2>
          <ul className="space-y-2">
            {grouped[kind].map((s) => (
              <li key={s.id} className="border border-stone-200 bg-white rounded p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.title}</div>
                    {s.body && <p className="text-xs text-stone-600 mt-1 whitespace-pre-wrap">{s.body}</p>}
                    {s.source_url && (
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 underline mt-1 inline-block"
                      >
                        🎥 출처
                      </a>
                    )}
                  </div>
                  <form action={deleteStrategy}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button className="text-xs text-stone-400 hover:text-red-600">삭제</button>
                  </form>
                </div>
              </li>
            ))}
            {grouped[kind].length === 0 && (
              <li className="text-xs text-stone-400 italic">아직 없습니다. 아래에서 추가하세요.</li>
            )}
          </ul>
        </section>
      ))}

      <form action={addStrategy} className="mt-8 border-t border-stone-200 pt-4 space-y-2">
        <h3 className="font-semibold text-sm">노트 추가</h3>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="type_id" value={type.id} />
        <select
          name="kind"
          required
          defaultValue="strategy"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm bg-white"
        >
          <option value="strategy">✅ 파훼법</option>
          <option value="failure">❌ 자주 실패</option>
          <option value="note">📝 메모</option>
        </select>
        <input
          name="title"
          required
          maxLength={200}
          placeholder="핵심 한 줄 (예: 길게 빼고 백핸드 푸시)"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <textarea
          name="body"
          rows={3}
          placeholder="상세 (선택)"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <input
          name="source_url"
          type="url"
          placeholder="유튜브/참고 URL (선택)"
          className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
        />
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
        >
          추가
        </button>
      </form>
    </div>
  );
}
