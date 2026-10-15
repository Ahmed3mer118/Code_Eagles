import { useCallback, useEffect, useState } from 'react';
import {
  Search, RefreshCw, Eye, Trash2, CheckCircle2, XCircle,
  Mail, Phone, User, MessageSquare, Send, X, ChevronLeft,
  ChevronRight, AlertCircle, Clock, Filter,
} from 'lucide-react';
import { contactService } from '../../../shared/api/contactService';
import { useI18n } from '../../../shared/i18n';

/* ============================================================
   Constants
   ============================================================ */
const STATUS_TABS = [
  { key: '',       ar: 'الكل',            en: 'All' },
  { key: 'new_',   ar: 'جديدة',           en: 'New' },
  { key: 'read_',  ar: 'مقروءة',          en: 'Read' },
  { key: 'replied',ar: 'تم الرد',         en: 'Replied' },
  { key: 'closed', ar: 'مغلقة',           en: 'Closed' },
];

const STATUS_BADGE = {
  new_:    { ar: 'جديدة',   en: 'New',      color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  read_:   { ar: 'مقروءة',  en: 'Read',     color: 'bg-slate-50 text-slate-700 border-slate-200',    dot: 'bg-slate-500' },
  replied: { ar: 'تم الرد', en: 'Replied',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  closed:  { ar: 'مغلقة',   en: 'Closed',   color: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
};

/* ============================================================
   Page
   ============================================================ */
export default function MessagesPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [detailItem, setDetailItem] = useState(null);
  const [replyItem, setReplyItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await contactService.list({
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(search.trim() && { search: search.trim() }),
      });
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل تحميل الرسائل' : 'Failed to load messages'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, statusFilter, search, isAr]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  /* ---------- Actions ---------- */
  const handleOpenDetail = async (item) => {
    // علّمها كمقروءة لو جديدة
    setDetailItem(item);
    if (item.status === 'new_') {
      try {
        const updated = await contactService.getOne(item.id);
        setDetailItem(updated);
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'read_' } : x)),
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleClose = async (item) => {
    try {
      await contactService.close(item.id);
      setDetailItem(null);
      await fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ============ Header ============ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isAr ? 'رسائل التواصل' : 'Contact Messages'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? 'الرسائل الواردة من نموذج التواصل في الصفحة الرئيسية'
              : 'Messages received from the landing page contact form'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* ============ Stats Row ============ */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label={isAr ? 'الإجمالي' : 'Total'}
          value={total}
          icon={MessageSquare}
          tone="indigo"
        />
        <StatCard
          label={isAr ? 'جديدة' : 'New'}
          value={items.filter((x) => x.status === 'new_').length}
          icon={Clock}
          tone="blue"
        />
        <StatCard
          label={isAr ? 'تم الرد' : 'Replied'}
          value={items.filter((x) => x.status === 'replied').length}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label={isAr ? 'مغلقة' : 'Closed'}
          value={items.filter((x) => x.status === 'closed').length}
          icon={XCircle}
          tone="rose"
        />
      </div>

      {/* ============ Filters ============ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {isAr ? 'الفلاتر' : 'Filters'}
          </span>
        </div>

        {/* Status tabs */}
        <div className="mb-3 inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* Search */}
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isAr ? 'ابحث بالاسم أو الإيميل أو الموضوع...' : 'Search by name, email or subject...'
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-10 pe-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>

      {/* ============ Error ============ */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============ List ============ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState isAr={isAr} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <Th>{isAr ? 'المرسل' : 'Sender'}</Th>
                    <Th>{isAr ? 'الموضوع' : 'Subject'}</Th>
                    <Th>{isAr ? 'الحالة' : 'Status'}</Th>
                    <Th>{isAr ? 'التاريخ' : 'Date'}</Th>
                    <Th align="end">{isAr ? 'إجراءات' : 'Actions'}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <MessageRow
                      key={item.id}
                      item={item}
                      isAr={isAr}
                      onView={() => handleOpenDetail(item)}
                      onReply={() => setReplyItem(item)}
                      onDelete={() => setDeletingItem(item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {isAr
                  ? `عرض ${items.length} من ${total}`
                  : `Showing ${items.length} of ${total}`}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <span className="px-3 text-sm font-bold text-slate-700">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============ Modals ============ */}
      {detailItem && (
        <MessageDetailModal
          item={detailItem}
          isAr={isAr}
          onClose={() => setDetailItem(null)}
          onReply={() => {
            setReplyItem(detailItem);
            setDetailItem(null);
          }}
          onClose_={() => handleClose(detailItem)}
        />
      )}

      {replyItem && (
        <ReplyModal
          item={replyItem}
          isAr={isAr}
          onClose={() => setReplyItem(null)}
          onSuccess={() => {
            setReplyItem(null);
            setDetailItem(null);
            fetchData(true);
          }}
        />
      )}

      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          isAr={isAr}
          onClose={() => setDeletingItem(null)}
          onSuccess={() => {
            setDeletingItem(null);
            fetchData(true);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   Sub Components
   ============================================================ */
function Th({ children, align = 'start' }) {
  return (
    <th className={`px-5 py-3.5 text-${align} text-[11px] font-extrabold tracking-wider text-slate-500`}>
      {children}
    </th>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-500/20' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-500/20' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-500/20' },
  };
  const c = tones[tone] ?? tones.indigo;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-4 ${c.bg} ${c.text} ${c.ring}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ isAr }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <MessageSquare className="h-8 w-8 text-slate-400" />
      </div>
      <p className="font-bold text-slate-900">
        {isAr ? 'لا توجد رسائل' : 'No messages'}
      </p>
      <p className="text-sm text-slate-500">
        {isAr ? 'لم يتم استلام أي رسائل بعد' : 'No messages received yet'}
      </p>
    </div>
  );
}

function MessageRow({ item, isAr, onView, onReply, onDelete }) {
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.new_;
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className="transition hover:bg-slate-50/60">
      {/* Sender */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-extrabold text-white shadow-md">
            {(item.name?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {item.name || (isAr ? 'زائر' : 'Anonymous')}
            </p>
            {item.email && (
              <p className="truncate text-xs text-slate-500" dir="ltr">
                {item.email}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Subject */}
      <td className="max-w-xs px-5 py-4">
        <p className="truncate text-sm font-semibold text-slate-700">
          {item.subject || (isAr ? '(بدون موضوع)' : '(No subject)')}
        </p>
        <p className="truncate text-xs text-slate-400">
          {item.message?.slice(0, 60)}
          {item.message?.length > 60 ? '...' : ''}
        </p>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${badge.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {isAr ? badge.ar : badge.en}
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-600">{formattedDate}</p>
        <p className="text-[11px] text-slate-400">
          {date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-end">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onView}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title={isAr ? 'عرض' : 'View'}
          >
            <Eye className="h-4 w-4" />
          </button>
          {item.status !== 'closed' && item.status !== 'replied' && (
            <button
              type="button"
              onClick={onReply}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
              title={isAr ? 'رد' : 'Reply'}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50"
            title={isAr ? 'حذف' : 'Delete'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   Modals
   ============================================================ */
function Modal({ onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon: Icon, title, subtitle, onClose, tone = 'indigo' }) {
  const toneClass = {
    indigo:  'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose:    'bg-rose-100 text-rose-600',
  }[tone];

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function MessageDetailModal({ item, isAr, onClose, onReply, onClose_ }) {
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.new_;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader
        icon={MessageSquare}
        title={item.subject || (isAr ? '(بدون موضوع)' : '(No subject)')}
        subtitle={
          new Date(item.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-GB')
        }
        onClose={onClose}
      />

      <div className="max-h-[70vh] overflow-y-auto p-6">
        {/* Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${badge.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            {isAr ? badge.ar : badge.en}
          </span>
        </div>

        {/* Sender info */}
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoBox
            icon={User}
            label={isAr ? 'الاسم' : 'Name'}
            value={item.name || (isAr ? 'زائر' : 'Anonymous')}
          />
          <InfoBox
            icon={Mail}
            label={isAr ? 'الإيميل' : 'Email'}
            value={item.email || '—'}
            dir="ltr"
          />
          <InfoBox
            icon={Phone}
            label={isAr ? 'الهاتف' : 'Phone'}
            value={item.phone || '—'}
            dir="ltr"
          />
        </div>

        {/* Original message */}
        <div className="mt-5">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {isAr ? 'الرسالة' : 'Message'}
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {item.message || '—'}
            </p>
          </div>
        </div>

        {/* Reply */}
        {item.replyMessage && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              {isAr ? 'الرد' : 'Reply'}
            </p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">
                {item.replyMessage}
              </p>
              {item.repliedAt && (
                <p className="mt-3 text-[11px] font-semibold text-emerald-700/70">
                  {isAr ? 'تم الرد في ' : 'Replied at '}
                  {new Date(item.repliedAt).toLocaleString(isAr ? 'ar-EG' : 'en-GB')}
                  {item.replier?.name && ` — ${item.replier.name}`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {isAr ? 'إغلاق' : 'Close'}
        </button>
        {item.status !== 'closed' && (
          <>
            {item.status !== 'replied' && (
              <button
                type="button"
                onClick={onReply}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
                {isAr ? 'رد' : 'Reply'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose_}
              className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              {isAr ? 'إغلاق الرسالة' : 'Close message'}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function InfoBox({ icon: Icon, label, value, dir }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function ReplyModal({ item, isAr, onClose, onSuccess }) {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (reply.trim().length < 2) {
      setError(isAr ? 'الرد قصير جداً' : 'Reply is too short');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await contactService.reply(item.id, reply.trim());
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل إرسال الرد' : 'Failed to send reply'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <ModalHeader
        icon={Send}
        title={isAr ? 'الرد على الرسالة' : 'Reply to Message'}
        subtitle={item.email || item.name}
        onClose={onClose}
        tone="emerald"
      />

      <div className="max-h-[70vh] overflow-y-auto p-6">
        {/* Original */}
        <div className="mb-5">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {isAr ? 'الرسالة الأصلية' : 'Original message'}
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
              {item.message}
            </p>
          </div>
        </div>

        {/* Reply */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {isAr ? 'الرد' : 'Reply'} <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder={isAr ? 'اكتب ردك هنا...' : 'Write your reply here...'}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="mt-1 text-xs text-slate-400">
            {reply.length} / 2000
          </p>
        </div>

        {/* Hint */}
        {item.email && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isAr
                ? `سيتم إرسال هذا الرد إلى ${item.email}`
                : `This reply will be sent to ${item.email}`}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          <Send className="h-4 w-4" />
          {isAr ? 'إرسال الرد' : 'Send Reply'}
        </button>
      </div>
    </Modal>
  );
}

function DeleteModal({ item, isAr, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await contactService.remove(item.id);
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل الحذف' : 'Delete failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <ModalHeader
        icon={Trash2}
        title={isAr ? 'حذف الرسالة' : 'Delete Message'}
        subtitle={item.subject}
        onClose={onClose}
        tone="rose"
      />
      <div className="p-6">
        <p className="text-sm text-slate-600">
          {isAr
            ? 'هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'Are you sure you want to delete this message? This action cannot be undone.'}
        </p>
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {isAr ? 'حذف' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
