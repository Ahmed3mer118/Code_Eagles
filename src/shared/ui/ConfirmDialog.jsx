export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="ce-card w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--ce-muted)]">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="ce-btn ce-btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            type="button"
            className={`ce-btn ${danger ? 'bg-[var(--ce-danger)] text-white' : 'ce-btn-accent'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
