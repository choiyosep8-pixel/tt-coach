# 🏓 TT Coach

탁구 상대 유형별 파훼법을 쌓아가는 개인 코치 노트.

## 아이디어
1기 코치가 *숏/롱/사파/왼손/드라이브 파워형* 등 상대 유형별로 케이스를 만들고 대비법을 2~3개씩 갖춰나간다는 얘기에서 출발. 5부부터는 *"기본 볼빵 + 자신만의 무기 → 다 부숴버리는"* 단계로 가는데, 그 무기는 결국 *유형별 파훼법의 누적*이라는 가설.

## 기능 (MVP)
- 🎯 8가지 상대 유형 카드 (숏 / 롱 / 초등 선출형 / 사파 펜홀더 / 왼손 / 드라이브 파워형 / 로빙 / 너클성 타격형)
- 📝 유형별 *파훼법 / 자주 실패 / 메모* 노트 추가 (유튜브 URL 첨부 가능)
- 🏓 매치 기록 (날짜, 상대, 유형, 점수, 통한 전략, 실패한 전략)
- 🧠 AI 코칭 (Claude API) — 누적 노트 + 매치 기록 기반으로 "다음 만남 시 시도할 3가지" 추천

## Stack
- Next.js 16 + React 19 + Tailwind 4
- Supabase (Postgres + Auth + RLS)
- Anthropic Claude API
- Vercel 배포

## Local Dev

```bash
cp .env.example .env.local
# .env.local 에 Supabase URL/key, ANTHROPIC_API_KEY 채우기

npm install
npm run dev
```

## 라이선스
MIT
