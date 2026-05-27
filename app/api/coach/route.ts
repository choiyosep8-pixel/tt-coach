import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAnthropic, MODEL } from '@/lib/claude';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  try {
    const { typeSlug } = (await req.json()) as { typeSlug: string };
    if (!typeSlug) {
      return NextResponse.json({ error: 'typeSlug 필요' }, { status: 400 });
    }

    const { data: type } = await supabase
      .from('opponent_types')
      .select('*')
      .eq('slug', typeSlug)
      .single();
    if (!type) return NextResponse.json({ error: '유형 없음' }, { status: 404 });

    const { data: strategies } = await supabase
      .from('counter_strategies')
      .select('kind,title,body')
      .eq('type_id', type.id);

    const { data: matches } = await supabase
      .from('matches')
      .select('played_at,opponent_name,my_score,opp_score,worked,failed,notes')
      .eq('type_id', type.id)
      .order('played_at', { ascending: false })
      .limit(20);

    const noteText = (strategies ?? [])
      .map((s) => `- [${s.kind}] ${s.title}${s.body ? ` :: ${s.body}` : ''}`)
      .join('\n') || '(아직 없음)';

    const matchText = (matches ?? [])
      .map(
        (m) =>
          `- ${m.played_at} vs ${m.opponent_name ?? '?'} ${m.my_score ?? '-'}:${m.opp_score ?? '-'} | 통함: ${m.worked ?? '-'} | 실패: ${m.failed ?? '-'}`
      )
      .join('\n') || '(아직 매치 기록 없음)';

    const anthropic = getAnthropic();
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system:
        '너는 한국 탁구 1:1 코치다. 사용자의 노트와 매치 기록을 보고 "다음에 이 유형 상대를 만나면" 무엇을 시도할지 핵심만 3가지로 조언한다. 한국어, 간결, 실전 행동 위주. 추측은 솔직히 추측이라고 말한다.',
      messages: [
        {
          role: 'user',
          content: `상대 유형: ${type.label} (${type.description ?? ''})

[내가 정리한 노트]
${noteText}

[최근 매치 기록]
${matchText}

이 데이터를 바탕으로, 다음 만남에서 시도할 구체 행동 3가지를 추천해줘. 형식:
1. ...
2. ...
3. ...
마지막에 '내 약점 패턴: ...' 한 줄.`,
        },
      ],
    });

    const advice = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    return NextResponse.json({ advice });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
