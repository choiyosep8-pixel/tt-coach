import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { SignOutButton } from './sign-out-button';

const ITEMS = [
  { href: '/',         label: '홈',   prefix: false },
  { href: '/sessions', label: '세션', prefix: true  },
  { href: '/types',    label: '유형', prefix: true  },
  { href: '/motion',   label: '모션', prefix: true  },
];

function matches(path: string | null, href: string, prefix: boolean): boolean {
  if (!path) return false;
  if (!prefix) return path === href;
  return path === href || path.startsWith(href + '/');
}

export async function Nav() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore
    .getAll()
    .some(
      (c) =>
        c.name.startsWith('sb-') &&
        (c.name.endsWith('-auth-token') || c.name.endsWith('-auth-token.0'))
    );

  const h = await headers();
  const path = h.get('x-pathname') ?? h.get('x-invoke-path') ?? null;

  return (
    <header
      className="border-b border-[#2a2a30] bg-[#0a0a0a] sticky top-0 z-10 safe-top"
    >
      <div className="max-w-3xl mx-auto px-4 pt-3 pb-3 flex items-center justify-between gap-2 min-w-0">
        <Link href="/" prefetch className="flex items-center gap-2 group shrink-0">
          <span className="font-mono text-[17px] font-bold tracking-tight text-[#a3e635]">TT</span>
          <span className="hidden sm:inline text-[13px] text-[#888892] group-hover:text-stone-100 transition">
            코치노트
          </span>
        </Link>
        {hasAuthCookie ? (
          <nav className="flex items-center gap-4 sm:gap-5 text-[14px] min-w-0">
            {ITEMS.map((it) => {
              const active = matches(path, it.href, it.prefix);
              return (
                <Link
                  key={it.href}
                  prefetch
                  href={it.href}
                  className={`transition shrink-0 py-1 ${
                    active
                      ? 'text-[#a3e635] font-bold'
                      : 'text-[#888892] hover:text-stone-100'
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
            <SignOutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded bg-[#a3e635] text-[#0a0a0a] text-[13px] font-bold hover:bg-lime-300 transition"
            >
              시작
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
