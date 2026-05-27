import { enter } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-12">
      <div className="text-center mb-6">
        <div className="text-5xl">🏓</div>
        <h1 className="text-2xl font-bold mt-3">TT Coach</h1>
        <p className="text-sm text-stone-600 mt-2">탁구 상대 유형별 파훼법 노트</p>
      </div>
      <form action={enter} className="space-y-3">
        <input
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          placeholder="휴대폰 번호 (예: 01012345678)"
          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-base"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
        >
          들어가기
        </button>
      </form>
      <p className="text-xs text-stone-500 mt-4 text-center leading-relaxed">
        처음 입장하시면 자동으로 계정이 만들어집니다.<br />
        비밀번호 없이 휴대폰 번호로만 들어와요.
      </p>
    </div>
  );
}
