'use client';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

type Variant = 'primary' | 'ghost' | 'small';

type Props = {
  label: string;
  pendingLabel?: string;
  savedLabel?: string;
  variant?: Variant;
  fullWidth?: boolean;
  showSavedToast?: boolean;
};

const VARIANT_CLS: Record<Variant, string> = {
  primary:
    'px-6 py-2.5 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-lime-300',
  ghost:
    'px-4 py-2 bg-[#14141a] border border-[#a3e635]/40 text-[#a3e635] rounded font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#a3e635] hover:text-[#0a0a0a]',
  small:
    'px-3 py-1.5 bg-[#a3e635] text-[#0a0a0a] rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-lime-300',
};

export function SubmitButton({
  label,
  pendingLabel = '저장 중…',
  savedLabel = '저장했습니다',
  variant = 'primary',
  fullWidth = false,
  showSavedToast = true,
}: Props) {
  const { pending } = useFormStatus();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !pending) {
      setSavedAt(Date.now());
      const t = setTimeout(() => setSavedAt(null), 1800);
      wasPendingRef.current = false;
      return () => clearTimeout(t);
    }
    if (pending) wasPendingRef.current = true;
  }, [pending]);

  const btn = (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${VARIANT_CLS[variant]} ${
        fullWidth ? 'w-full' : ''
      } disabled:opacity-60 disabled:cursor-wait transition inline-flex items-center justify-center gap-2`}
    >
      {pending ? (
        <>
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );

  if (!showSavedToast) return btn;

  return (
    <div
      className={`flex items-center gap-3 ${
        fullWidth ? 'w-full sm:w-auto' : ''
      } ${fullWidth ? '' : 'flex-wrap'}`}
    >
      {btn}
      <span
        className={`text-[11px] uppercase tracking-[0.2em] text-[#a3e635] transition-opacity duration-200 ${
          savedAt ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        ✓ {savedLabel}
      </span>
    </div>
  );
}
