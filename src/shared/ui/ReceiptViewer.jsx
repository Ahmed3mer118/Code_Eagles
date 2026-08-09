import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2, ReceiptText } from 'lucide-react';
import Modal from './Modal';
import resolveMediaUrl from '../utils/mediaUrl';

/**
 * Receipt image that opens centered in a modal instead of a new tab.
 * `variant="thumb"` renders a clickable preview, `variant="link"` a compact button.
 */
export default function ReceiptViewer({ url, variant = 'thumb', label, className = '' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!url) return null;

  const src = resolveMediaUrl(url);
  const title = label || t('payments.viewReceipt');

  return (
    <>
      {variant === 'thumb' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`group relative block w-full overflow-hidden rounded-xl border border-[var(--ce-border)] ${className}`}
          aria-label={title}
        >
          <img src={src} alt="" loading="lazy" className="max-h-36 w-full object-cover transition group-hover:scale-[1.02]" />
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
            {title}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`ce-btn ce-btn-ghost inline-flex items-center gap-1 text-xs ${className}`}
        >
          <ReceiptText className="h-3.5 w-3.5" />
          {title}
        </button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        size="lg"
        footer={
          <a className="ce-btn ce-btn-ghost text-sm" href={src} target="_blank" rel="noreferrer">
            {t('payments.openOriginal')}
          </a>
        }
      >
        <img src={src} alt={title} className="mx-auto max-h-[65vh] w-auto rounded-xl object-contain" />
      </Modal>
    </>
  );
}
