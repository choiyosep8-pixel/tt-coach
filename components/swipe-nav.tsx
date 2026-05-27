'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// 메뉴 순서: 홈 ↔ 세션 ↔ 유형분석 ↔ 모션분석
const ORDER = ['/', '/sessions', '/types', '/motion'];

function matchIndex(path: string): number {
  // 정확 매치 우선
  if (ORDER.includes(path)) return ORDER.indexOf(path);
  // prefix 매치 ('/sessions/123', '/sessions/new' 등도 세션으로)
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const p = ORDER[i];
    if (p === '/') continue;
    if (path === p || path.startsWith(p + '/')) return i;
  }
  return -1;
}

export function SwipeNav() {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const idx = matchIndex(path);
    if (idx < 0) return;

    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let active = false;

    function onStart(e: TouchEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // 입력·미디어·스와이프 명시적 차단 요소 안에서는 무시
      if (
        target.closest(
          'input, textarea, select, button, a, iframe, video, audio, [data-no-swipe]'
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
    }

    function onEnd(e: TouchEvent) {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      const dt = Date.now() - t0;
      if (dt > 600) return;
      if (Math.abs(dx) < 70) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) return; // 세로 우세면 스크롤로 간주

      if (dx < 0) {
        // ← 왼쪽으로 swipe = 다음 메뉴
        const ni = Math.min(ORDER.length - 1, idx + 1);
        if (ni !== idx) router.push(ORDER[ni]);
      } else {
        // → 오른쪽으로 swipe = 이전 메뉴
        const pi = Math.max(0, idx - 1);
        if (pi !== idx) router.push(ORDER[pi]);
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
    };
  }, [path, router]);

  return null;
}
