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
      if (!res.ok) throw new Error(json.error ?? '코칭 요청 실패');
      setAdvice(json.advice);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        onClick={ask}
        disabled={loading}
        className="w-full py-2 bg-stone-900 text-white rounded hover:bg-stone-700 text-sm disabled:opacity-50"
      >
        {loading ? '코치가 생각 중…' : `🧠 ${typeLabel} 상대 AI 코칭 받기`}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {advice && (
        <div className="mt-3 border border-emerald-200 bg-emerald-50 rounded p-3 text-sm whitespace-pre-wrap">
          {advice}
        </div>
      )}
    </div>
  );
}
