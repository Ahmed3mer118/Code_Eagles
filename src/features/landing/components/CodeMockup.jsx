// src/features/landing/components/CodeMockup.jsx
import { useI18n } from '../../../shared/i18n';

export default function CodeMockup({ variant = 'hero' }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const data = {
    hero: {
      filename: 'main.jsx',
      lines: [
        { n: 1,  parts: [{ t: 'kw', v: 'import' }, { t: 'pl', v: ' { useState } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " 'react';" }] },
        { n: 2,  parts: [{ t: 'kw', v: 'import' }, { t: 'pl', v: ' { Code, Zap } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " 'lucide-react';" }] },
        { n: 3,  parts: [] },
        { n: 4,  parts: [{ t: 'kw', v: 'function' }, { t: 'pl', v: ' App() {' }] },
        { n: 5,  parts: [{ t: 'kw', v: '  const' }, { t: 'pl', v: ' [learning, setLearning] = ' }, { t: 'fn', v: 'useState' }, { t: 'pl', v: '(' }, { t: 'bool', v: 'true' }, { t: 'pl', v: ');' }] },
        { n: 6,  parts: [] },
        { n: 7,  parts: [{ t: 'kw', v: '  return' }, { t: 'pl', v: ' (' }] },
        { n: 8,  parts: [{ t: 'tag', v: '    <div' }, { t: 'attr', v: ' className' }, { t: 'pl', v: '=' }, { t: 'str', v: "'app'" }, { t: 'tag', v: '>' }] },
        { n: 9,  parts: [{ t: 'tag', v: '      <Code' }, { t: 'attr', v: ' size' }, { t: 'pl', v: '=' }, { t: 'num', v: '{48}' }, { t: 'tag', v: ' />' }] },
        { n: 10, parts: [{ t: 'tag', v: '      <h1>' }, { t: 'pl', v: 'Learn. Build. Ship.' }, { t: 'tag', v: '</h1>' }] },
        { n: 11, parts: [{ t: 'tag', v: '    </div>' }] },
        { n: 12, parts: [{ t: 'kw', v: '  );' }] },
        { n: 13, parts: [{ t: 'kw', v: '}' }] },
      ],
    },
    cta: {
      filename: 'grow.tsx',
      lines: [
        { n: 1, parts: [{ t: 'kw', v: 'import' }, { t: 'pl', v: ' { rocket } ' }, { t: 'kw', v: 'from' }, { t: 'str', v: " '@code-eagles/core';" }] },
        { n: 2, parts: [] },
        { n: 3, parts: [{ t: 'kw', v: 'async function' }, { t: 'pl', v: ' launch() {' }] },
        { n: 4, parts: [{ t: 'kw', v: '  const' }, { t: 'pl', v: ' future = ' }, { t: 'kw', v: 'await' }, { t: 'pl', v: ' rocket.' }, { t: 'fn', v: 'build' }, { t: 'pl', v: '({' }] },
        { n: 5, parts: [{ t: 'attr', v: '    vision' }, { t: 'pl', v: ': ' }, { t: 'str', v: "'ship-to-prod'" }, { t: 'pl', v: ',' }] },
        { n: 6, parts: [{ t: 'pl', v: '  });' }] },
        { n: 7, parts: [] },
        { n: 8, parts: [{ t: 'kw', v: '  return' }, { t: 'pl', v: ' future.success;' }] },
        { n: 9, parts: [{ t: 'kw', v: '}' }] },
      ],
    },
  };

  const d = data[variant] || data.hero;

  const colorMap = {
    kw: 'text-[#c792ea]',
    pl: 'text-white/80',
    str: 'text-[#c3e88d]',
    fn: 'text-[#82aaff]',
    tag: 'text-[#f07178]',
    attr: 'text-[#ffcb6b]',
    num: 'text-[#f78c6c]',
    bool: 'text-[#f78c6c]',
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1a] shadow-2xl"
      dir="ltr"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
          {d.filename}
        </span>
        <span className="text-[10px] font-mono text-white/30">{isAr ? 'JS' : 'TS'}</span>
      </div>

      <div className="overflow-x-auto px-3 py-4 font-mono text-[11px] leading-[1.75] sm:text-xs">
        {d.lines.map((line) => (
          <div key={line.n} className="flex items-start gap-3 whitespace-pre">
            <span className="w-5 shrink-0 select-none text-end text-white/20">{line.n}</span>
            <span>
              {line.parts.map((p, i) => (
                <span key={i} className={colorMap[p.t] || 'text-white/80'}>
                  {p.v}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-[#0f172a] px-4 py-2 text-[10px] font-mono text-white/40">
        <span>✓ main</span>
        <span>{isAr ? 'جاهز' : 'Ready'}</span>
      </div>
    </div>
  );
}
