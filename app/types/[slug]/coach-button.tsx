'use client';
import { useState } from 'react';

export function CoachButton({ typeSlug, typeLabel }: { typeSlug: string; typeLabel: string }) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Coach request failed');
      setAdvice(json.advice);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-8">
      <button
        onClick={ask}
        disabled={loading}
        className="w-full py-3.5 bg-[#14141a] border border-[#a3e635]/40 text-[#a3e635] rounded-lg font-bold text-[11px] uppercase tracking-[0.25em] hover:bg-[#a3e635] hover:text-[#0a0a0a] disabled:opacity-40 disabled:hover:bg-[#14141a] disabled:hover:text-[#a3e635] transition"
      >
        {loading ? 'Coach thinking…' : `AI Coach · ${typeLabel} 다음 만남 대비`}
      </button>
      {error && <p className="text-[11px] text-[#f97316] mt-2 px-1">{error}</p>}
      {advice && (
        <div className="mt-3 border border-[#a3e635]/30 bg-[#a3e635]/[0.04] rounded-lg p-4 text-[13px] whitespace-pre-wrap leading-relaxed text-stone-100">
          {advice}
        </div>
      )}
    </div>
  );
}
