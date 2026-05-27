'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('82') && digits.length >= 12) return '0' + digits.slice(2);
  if (/^01\d{8,9}$/.test(digits)) return digits;
  return null;
}

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError('올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const email = `${normalized}@phone.tt-coach.local`;
    const password = `tt-${normalized}-key`;

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: normalized, phone: normalized } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (!signUpData.session) {
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) {
          setError(retry.error.message);
          setLoading(false);
          return;
        }
      }
    }

    router.replace('/');
    router.refresh();
  }

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
      <form onSubmit={submit} className="space-y-3">
        <input
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          disabled={loading}
          className="w-full py-3.5 bg-[#a3e635] text-[#0a0a0a] rounded-lg hover:bg-lime-300 font-bold uppercase tracking-[0.2em] text-sm transition disabled:opacity-50"
        >
          {loading ? 'Entering…' : 'Enter'}
        </button>
      </form>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a5a62] mt-8 text-center leading-relaxed">
        Phone number only.<br />
        No password. First entry = signup.
      </p>
    </div>
  );
}
