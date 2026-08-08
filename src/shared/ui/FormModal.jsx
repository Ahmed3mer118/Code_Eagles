import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import useFormDraft from '../hooks/useFormDraft';

export default function FormModal({
  open,
  onClose,
  title,
  draftKey,
  initialValues,
  onSubmit,
  children,
  size = 'md',
  validate,
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { loadDraft, clearDraft, hasDraft } = useFormDraft(draftKey, values, { enabled: open && !!draftKey });

  useEffect(() => {
    if (!open) return;
    const draft = draftKey ? loadDraft() : null;
    setValues(draft || initialValues);
    setErrors({});
  }, [open, draftKey, JSON.stringify(initialValues)]);

  const handleClose = () => {
    if (draftKey && hasDraft()) {
      const ok = window.confirm(t('modal.unsavedConfirm'));
      if (!ok) return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const validationErrors = validate?.(values) || {};
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
      if (draftKey) clearDraft();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size={size}
      footer={(
        <>
          <button type="button" className="ce-btn ce-btn-ghost" onClick={handleClose} disabled={saving}>
            {t('common.cancel')}
          </button>
          <button type="button" className="ce-btn ce-btn-accent" onClick={handleSubmit} disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit}>
        {typeof children === 'function' ? children({ values, setValues, errors, saving }) : children}
      </form>
    </Modal>
  );
}
