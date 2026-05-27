import Link from 'next/link';
import { signup } from '../login/actions';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form action={signup} className="space-y-3">
        <input
          name="display_name"
          type="text"
          placeholder="표시 이름 (선택)"
          className="w-full px-3 py-2 border border-stone-300 rounded"
        />
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
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          className="w-full px-3 py-2 border border-stone-300 rounded"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          가입하기
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-600 text-center">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-emerald-700 underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
