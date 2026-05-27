import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addStrategy, deleteStrategy } from './actions';
import { CoachButton } from './coach-button';
import { MasteryEditor } from '@/components/mastery-editor';
import { SubmitButton } from '@/components/submit-button';
import { typeCode } from '@/lib/type-codes';

const KIND_META: Record<string, { label: string; color: string; dot: string }> = {
  strategy: { label: 'Counter',  color: 'text-[#a3e635]', dot: 'bg-[#a3e635]' },
  failure:  { label: 'Pitfall',  color: 'text-[#f97316]', dot: 'bg-[#f97316]' },
  note:     { label: 'Note',     color: 'text-[#888892]', dot: 'bg-[#888892]' },
};
const KIND_ORDER = ['strategy', 'failure', 'note'] as const;

export default async function TypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: type } = await supabase
    .from('opponent_types')
    .select('*')
    .eq('slug', slug)
    .single();
  if (!type) notFound();

  const [{ data: strategies }, { data: mastery }] = await Promise.all([
    supabase
      .from('counter_strategies')
      .select('*')
      .eq('type_id', type.id)
      .order('kind')
      .order('created_at', { ascending: false }),
    supabase
      .from('type_mastery')
      .select('*')
      .eq('user_id', user.id)
      .eq('type_id', type.id)
      .maybeSingle(),
  ]);

  const grouped: Record<string, NonNullable<typeof strategies>> = {
    strategy: [],
    failure: [],
    note: [],
  };
  (strategies ?? []).forEach((s) => grouped[s.kind]?.push(s));

  const code = typeCode(type.slug);
  const num = String(type.sort_order).padStart(2, '0');

  return (
    <div>
      <Link
        href="/types"
        prefetch
        className="text-[10px] tracking-[0.25em] uppercase text-[#5a5a62] hover:text-stone-100 transition"
      >
        ← Catalog
      </Link>

      <header className="mt-4 mb-6 border-b border-[#2a2a30] pb-6">
        <div className="font-mono text-[11px] tracking-[0.25em] text-[#5a5a62]">{num} · TYPE</div>
        <div className="font-mono text-[13px] tracking-[0.25em] text-[#a3e635] mt-3">{code}</div>
        <h1 className="text-3xl font-bold mt-2 tracking-tight">{type.label}</h1>
        <p className="text-[14px] text-[#888892] mt-3 leading-relaxed max-w-prose">
          {type.description}
        </p>
      </header>

      <MasteryEditor
        typeId={type.id}
        slug={type.slug}
        initialPct={mastery?.mastery_percent ?? 0}
        initialPartners={mastery?.partners ?? []}
      />

      {process.env.ANTHROPIC_API_KEY && (
        <CoachButton typeSlug={type.slug} typeLabel={type.label} />
      )}

      {KIND_ORDER.map((kind) => {
        const list = grouped[kind];
        const meta = KIND_META[kind];
        return (
          <section key={kind} className="mt-8">
            <h2 className="text-[10px] tracking-[0.25em] uppercase mb-3 flex items-center gap-2.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className={meta.color}>{meta.label}</span>
              <span className="text-[#5a5a62] font-mono">{String(list.length).padStart(2, '0')}</span>
            </h2>
            <ul className="space-y-2">
              {list.map((s) => (
                <li key={s.id} className="bg-[#14141a] border border-[#2a2a30] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[14px] text-stone-100 leading-snug">
                        {s.title}
                      </div>
                      {s.body && (
                        <p className="text-[13px] text-[#888892] mt-2 whitespace-pre-wrap leading-relaxed">
                          {s.body}
                        </p>
                      )}
                      {s.source_url && (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] uppercase tracking-[0.2em] text-[#a3e635] mt-2.5 inline-block hover:underline"
                        >
                          ↗ Source
                        </a>
                      )}
                    </div>
                    <form action={deleteStrategy}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button className="text-[10px] uppercase tracking-[0.15em] text-[#5a5a62] hover:text-[#f97316] transition">
                        Del
                      </button>
                    </form>
                  </div>
                </li>
              ))}
              {list.length === 0 && (
                <li className="text-[11px] uppercase tracking-[0.2em] text-[#5a5a62] px-1">
                  No entries yet.
                </li>
              )}
            </ul>
          </section>
        );
      })}

      <form action={addStrategy} className="mt-10 border-t border-[#2a2a30] pt-6 space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#888892] mb-3">+ Add Entry</h3>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="type_id" value={type.id} />
        <select
          name="kind"
          required
          defaultValue="strategy"
          className="w-full px-3 py-2.5 bg-[#14141a] border border-[#2a2a30] rounded text-sm text-stone-100 focus:outline-none focus:border-[#a3e635]"
        >
          <option value="strategy">Counter — 파훼법</option>
          <option value="failure">Pitfall — 자주 실패</option>
          <option value="note">Note — 메모</option>
        </select>
        <input
          name="title"
          required
          maxLength={200}
          placeholder="핵심 한 줄 (예: 길게 빼고 백핸드 푸시)"
          className="w-full px-3 py-2.5 bg-[#14141a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
        <textarea
          name="body"
          rows={3}
          placeholder="상세 (선택)"
          className="w-full px-3 py-2.5 bg-[#14141a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
        <input
          name="source_url"
          type="url"
          placeholder="https:// 참고 영상·자료 (선택)"
          className="w-full px-3 py-2.5 bg-[#14141a] border border-[#2a2a30] rounded text-sm text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635]"
        />
        <SubmitButton label="노트 추가" pendingLabel="추가 중…" savedLabel="추가됐어요" fullWidth />
      </form>
    </div>
  );
}
