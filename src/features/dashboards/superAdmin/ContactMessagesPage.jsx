import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, Phone, User } from 'lucide-react';
import { contactApi } from '../../../shared/api/contactApi';
import SearchInput from '../../../shared/ui/SearchInput';
import StatusBadge from '../../../shared/ui/StatusBadge';
import PageHeader from '../../../shared/ui/PageHeader';
import EmptyState from '../../../shared/ui/EmptyState';
import Modal from '../../../shared/ui/Modal';

const STATUS_FILTERS = ['all', 'pending', 'replied'];

function formatDate(value, lang) {
  if (!value) return '—';
  return new Date(value).toLocaleString(lang === 'en' ? 'en-EG' : 'ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ContactMessagesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const load = async () => {
    try {
      const res = await contactApi.list();
      setItems(res.messages || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter === 'pending') list = list.filter((item) => !item.isReplied);
    if (statusFilter === 'replied') list = list.filter((item) => item.isReplied);
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q)
    );
  }, [items, search, statusFilter]);

  const pendingCount = items.filter((item) => !item.isReplied).length;

  const openReply = (item) => {
    setSelected(item);
    setReply(item.adminReply || '');
  };

  const closeReply = () => {
    setSelected(null);
    setReply('');
  };

  const submitReply = async () => {
    if (!selected || !reply.trim()) return;
    setReplying(true);
    try {
      await contactApi.reply(selected._id, reply.trim());
      toast.success(t('common.success'));
      closeReply();
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.contactMessages')}
        subtitle={
          pendingCount
            ? `${t('admin.contactMessagesHint')} · ${t('admin.pendingContactCount', { count: pendingCount })}`
            : t('admin.contactMessagesHint')
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                statusFilter === key
                  ? 'bg-[var(--ce-brand)] text-white'
                  : 'border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-muted)]'
              }`}
              onClick={() => setStatusFilter(key)}
            >
              {t(`admin.contactFilter.${key}`)}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} className="sm:max-w-xs" />
      </div>

      {loading ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('admin.noContactMessages')} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <article key={item._id} className="ce-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={item.isReplied ? 'approved' : 'pending'}
                      label={item.isReplied ? t('admin.replied') : t('admin.pendingReply')}
                    />
                    <span className="text-xs text-[var(--ce-muted)]">{formatDate(item.created_at, lang)}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <p className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
                      <span className="font-bold text-[var(--ce-text)]">{item.name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
                      <a href={`mailto:${item.email}`} className="truncate text-[var(--ce-primary)] hover:underline">
                        {item.email}
                      </a>
                    </p>
                    <p className="flex items-center gap-2 text-sm sm:col-span-2">
                      <Phone className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
                      <a href={`tel:${item.phone}`} className="text-[var(--ce-text)] hover:underline">
                        {item.phone || '—'}
                      </a>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
                      <MessageSquare className="h-4 w-4" />
                      {t('contactPage.message')}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ce-text)]">{item.message}</p>
                  </div>

                  {item.isReplied && item.adminReply ? (
                    <div className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
                        {t('admin.yourReply')}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ce-text)]">{item.adminReply}</p>
                    </div>
                  ) : null}
                </div>

                <button type="button" className="ce-btn ce-btn-primary shrink-0 text-sm" onClick={() => openReply(item)}>
                  {item.isReplied ? t('admin.editReply') : t('admin.replyToMessage')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={closeReply}
        title={t('admin.replyToMessage')}
        footer={
          <>
            <button type="button" className="ce-btn ce-btn-ghost" onClick={closeReply}>
              {t('common.cancel')}
            </button>
            <button type="button" className="ce-btn ce-btn-primary" onClick={submitReply} disabled={replying || !reply.trim()}>
              {replying ? t('common.loading') : t('admin.sendReply')}
            </button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 text-sm">
              <p className="font-bold text-[var(--ce-text)]">{selected.name}</p>
              <p className="text-[var(--ce-muted)]">{selected.email}</p>
              <p className="mt-2 whitespace-pre-wrap text-[var(--ce-text)]">{selected.message}</p>
            </div>
            <div>
              <label className="ce-label">{t('admin.yourReply')}</label>
              <textarea
                className="ce-input min-h-[160px]"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                required
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
