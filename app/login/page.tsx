import Link from 'next/link';
import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>
      <form action={login} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          className="w-full px-3 py-2 border border-stone-300 rounded"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          className="w-full px-3 py-2 border border-stone-300 rounded"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          로그인
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-600 text-center">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-emerald-700 underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
