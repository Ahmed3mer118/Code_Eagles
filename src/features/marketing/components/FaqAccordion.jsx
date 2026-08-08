import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article key={item.question} className="ce-card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="font-bold text-[var(--ce-primary)]">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[var(--ce-accent)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[var(--ce-border)] px-5 pb-5 pt-3 text-[var(--ce-muted)] leading-relaxed">
                {item.answer}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
