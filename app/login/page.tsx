import { enter } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-12">
        <div className="font-mono text-5xl font-bold text-[#a3e635] tracking-tight">TT</div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#888892] mt-2">Coach</div>
        <p className="text-sm text-[#888892] mt-8 tracking-wide leading-relaxed">
          상대 유형을 분류한다.<br />
          파훼법을 쌓는다.
        </p>
      </div>
      <form action={enter} className="space-y-3">
        <input
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          placeholder="01012345678"
          className="w-full px-4 py-3.5 bg-[#14141a] border border-[#2a2a30] rounded-lg text-stone-100 placeholder:text-[#5a5a62] focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition tracking-wider"
        />
        {error && (
          <p className="text-[11px] text-[#f97316] border border-[#f97316]/30 bg-[#f97316]/10 rounded px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#a3e635] text-[#0a0a0a] rounded-lg hover:bg-lime-300 font-bold uppercase tracking-[0.2em] text-sm transition"
        >
          Enter
        </button>
      </form>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] mt-8 text-center leading-relaxed">
        Phone number only.<br />
        No password. First entry = signup.
      </p>
    </div>
  );
}
