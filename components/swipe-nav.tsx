'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ORDER = [
  { path: '/',         label: '홈' },
  { path: '/sessions', label: '세션' },
  { path: '/types',    label: '유형분석' },
  { path: '/motion',   label: '모션분석' },
];

function matchIndex(path: string): number {
  const exact = ORDER.findIndex((m) => m.path === path);
  if (exact >= 0) return exact;
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const p = ORDER[i].path;
    if (p === '/') continue;
    if (path === p || path.startsWith(p + '/')) return i;
  }
  return -1;
}

export function SwipeNav() {
  const path = usePathname();
  const router = useRouter();
  const idx = matchIndex(path);

  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ label: string; dir: 'next' | 'prev' } | null>(null);

  const idxRef = useRef(idx);
  const routerRef = useRef(router);
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let active = false;
    let crossed = false;
    let navigated = false;

    function vibrate(ms: number | number[]) {
      try {
        (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(ms);
      } catch {
        /* ignore */
      }
    }

    function onStart(e: TouchEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // 진짜 입력 영역만 차단: 텍스트 입력·미디어 컨트롤·명시적 차단
      // 링크(<a>)와 버튼(<button>)은 카드 그리드를 덮고 있어 제외하면 swipe 자체 불가
      if (
        target.closest(
          'input, textarea, select, iframe, video, audio, [data-no-swipe]'
        )
      ) {
        active = false;
        return;
      }
      if (e.touches.length !== 1) {
        active = false;
        return;
      }
      const t = e.touches[0];
      x0 = t.clientX;
      y0 = t.clientY;
      t0 = Date.now();
      active = true;
      crossed = false;
      navigated = false;
    }

    function onMove(e: TouchEvent) {
      if (!active || navigated) return;
      const t = e.touches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;

      if (Math.abs(dy) > 24 && Math.abs(dx) < Math.abs(dy) * 1.15) {
        active = false;
        setProgress(0);
        return;
      }

      const norm = Math.max(-1, Math.min(1, dx / 110));
      setProgress(norm);

      const abs = Math.abs(norm);
      if (abs >= 0.55 && !crossed) {
        crossed = true;
        vibrate(15);
      } else if (abs < 0.45) {
        crossed = false;
      }
    }

    function jamClickFor(ms: number) {
      // swipe 직후 들어오는 click 이벤트를 N ms 동안 capture 단계에서 차단
      const blocker = (ev: Event) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      document.addEventListener('click', blocker, { capture: true });
      document.addEventListener('touchend', blocker, { capture: true });
      window.setTimeout(() => {
        document.removeEventListener('click', blocker, { capture: true } as EventListenerOptions);
        document.removeEventListener('touchend', blocker, { capture: true } as EventListenerOptions);
      }, ms);
    }

    function onEnd(e: TouchEvent) {
      if (!active) {
        setProgress(0);
        return;
      }
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      const dt = Date.now() - t0;
      setProgress(0);

      if (navigated) return;
      if (dt > 700) return;
      if (Math.abs(dx) < 60) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.4) return;

      const curIdx = idxRef.current;
      if (curIdx < 0) return;

      const goTo = (next: typeof ORDER[number], dir: 'next' | 'prev') => {
        navigated = true;
        jamClickFor(280);
        setToast({ label: next.label, dir });
        window.setTimeout(() => setToast(null), 800);
        routerRef.current.push(next.path);
      };

      if (dx < 0) {
        if (curIdx < ORDER.length - 1) {
          goTo(ORDER[curIdx + 1], 'next');
        } else {
          vibrate([5, 30, 5]);
        }
      } else {
        if (curIdx > 0) {
          goTo(ORDER[curIdx - 1], 'prev');
        } else {
          vibrate([5, 30, 5]);
        }
      }
    }

    function onCancel() {
      active = false;
      setProgress(0);
    }

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
    };
  }, []);

  if (idx < 0) return null;

  return (
    <>
      {progress > 0 && (
        <div
          aria-hidden
          className="fixed top-0 left-0 bottom-0 z-50 pointer-events-none"
          style={{
            width: `${4 + progress * 16}px`,
            opacity: progress,
            background: 'linear-gradient(to right, #a3e635, transparent)',
            boxShadow: progress >= 0.55 ? '0 0 12px #a3e635' : undefined,
          }}
        />
      )}
      {progress < 0 && (
        <div
          aria-hidden
          className="fixed top-0 right-0 bottom-0 z-50 pointer-events-none"
          style={{
            width: `${4 + -progress * 16}px`,
            opacity: -progress,
            background: 'linear-gradient(to left, #a3e635, transparent)',
            boxShadow: -progress >= 0.55 ? '0 0 12px #a3e635' : undefined,
          }}
        />
      )}

      <div
        aria-hidden
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 pointer-events-none"
      >
        {ORDER.map((m, i) => {
          const isActive = i === idx;
          return (
            <span
              key={m.path}
              className="block rounded-full transition-all duration-150"
              style={{
                width: isActive ? 18 : 5,
                height: isActive ? 4 : 5,
                backgroundColor: isActive ? '#a3e635' : 'rgba(136,136,146,0.55)',
                boxShadow: isActive ? '0 0 8px #a3e635' : undefined,
              }}
            />
          );
        })}
      </div>

      {toast && (
        <div
          aria-hidden
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-[#a3e635] text-[#0a0a0a] px-5 py-2.5 rounded-lg font-bold uppercase tracking-[0.2em] text-sm shadow-[0_0_20px_rgba(163,230,53,0.4)] flex items-center gap-2">
            {toast.dir === 'prev' && <span>←</span>}
            <span>{toast.label}</span>
            {toast.dir === 'next' && <span>→</span>}
          </div>
        </div>
      )}
    </>
  );
}
