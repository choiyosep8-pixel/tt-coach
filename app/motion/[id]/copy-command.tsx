'use client';
import { useState } from 'react';

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={copy}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-[#0a0a0a] border border-[#2a2a30] rounded font-mono text-[14px] text-stone-100 hover:border-[#a3e635]/60 transition"
    >
      <span className="truncate text-left">{command}</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#a3e635] shrink-0">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
