import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { parentApi, studentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import ContentLoader from '../../shared/ui/ContentLoader';
import EmptyState from '../../shared/ui/EmptyState';
import FormField from '../../shared/ui/FormField';
import { Link2, UserPlus } from 'lucide-react';
import { getApiErrorMessage } from '../../shared/utils/apiError';

export default function ParentLinkRequestsPage() {
  const { t } = useTranslation();

  const [contact, setContact] = useState('');
  const [lookup, setLookup] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await parentApi.listPendingLinkRequests();
      setPending(data.links || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitting(true);
    try {
      const data = await parentApi.lookupStudent(contact.trim());
      setLookup(data.student);
    } catch (err) {
      setLookup(null);
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequest = async () => {
    setSubmitting(true);
    try {
      await parentApi.createLinkRequest({ contact: contact.trim(), studentId: lookup?._id });
      toast.success(t('linkRequest.sent'));
      setContact('');
      setLookup(null);
      loadPending();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id, decision) => {
    try {
      await parentApi.respondLinkRequest(id, { decision });
      toast.success(t('linkRequest.updated'));
      loadPending();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t('linkRequest.title')} subtitle={t('linkRequest.parentHint')} icon={Link2} />

      <form onSubmit={handleLookup} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <FormField label={t('linkRequest.studentContact')} required>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('linkRequest.contactPlaceholder')}
            className="w-full rounded-xl border px-3 py-2"
          />
        </FormField>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[var(--ce-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          {t('linkRequest.findStudent')}
        </button>

        {lookup && (
          <div className="rounded-xl bg-gray-50 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{lookup.name}</p>
              <p className="text-sm text-gray-500">{lookup.gradeLevel || t('linkRequest.noGrade')}</p>
            </div>
            <button
              type="button"
              onClick={handleRequest}
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {t('linkRequest.sendRequest')}
            </button>
          </div>
        )}
      </form>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('linkRequest.pendingTitle')}</h2>
        {loading ? (
          <ContentLoader />
        ) : pending.length === 0 ? (
          <EmptyState title={t('linkRequest.noPending')} icon={UserPlus} />
        ) : (
          <div className="space-y-3">
            {pending.map((link) => {
              const isIncoming = link.requestedBy === 'student';
              const other = isIncoming ? link.studentId : link.studentId;
              return (
                <div key={link._id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <p className="font-semibold">{other?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isIncoming ? t('linkRequest.incomingFromStudent') : t('linkRequest.waitingStudent')}
                  </p>
                  {isIncoming && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(link._id, 'approve')}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
                      >
                        {t('linkRequest.approve')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespond(link._id, 'reject')}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600"
                      >
                        {t('linkRequest.reject')}
                      </button>
                    </div>
                  )}
                  {!isIncoming && (
                    <button
                      type="button"
                      onClick={() => handleRespond(link._id, 'cancel')}
                      className="mt-3 rounded-lg border px-3 py-1.5 text-sm"
                    >
                      {t('linkRequest.cancel')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function StudentLinkRequestsPage() {
  const { t } = useTranslation();
  const [contact, setContact] = useState('');
  const [lookup, setLookup] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentApi.listPendingLinkRequests();
      setPending(data.links || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitting(true);
    try {
      const data = await studentApi.lookupParent(contact.trim());
      setLookup(data.parent);
    } catch (err) {
      setLookup(null);
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequest = async () => {
    setSubmitting(true);
    try {
      await studentApi.createLinkRequest({ contact: contact.trim(), parentId: lookup?._id });
      toast.success(t('linkRequest.sent'));
      setContact('');
      setLookup(null);
      loadPending();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id, decision) => {
    try {
      await studentApi.respondLinkRequest(id, { decision });
      toast.success(t('linkRequest.updated'));
      loadPending();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t('linkRequest.title')} subtitle={t('linkRequest.studentHint')} icon={Link2} />

      <form onSubmit={handleLookup} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <FormField label={t('linkRequest.parentContact')} required>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('linkRequest.contactPlaceholder')}
            className="w-full rounded-xl border px-3 py-2"
          />
        </FormField>
        <button type="submit" disabled={submitting} className="rounded-xl bg-[var(--ce-primary)] px-4 py-2 text-sm font-semibold text-white">
          {t('linkRequest.findParent')}
        </button>

        {lookup && (
          <div className="rounded-xl bg-gray-50 p-4 flex items-center justify-between gap-3">
            <p className="font-semibold">{lookup.name}</p>
            <button type="button" onClick={handleRequest} disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              {t('linkRequest.sendRequest')}
            </button>
          </div>
        )}
      </form>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('linkRequest.pendingTitle')}</h2>
        {loading ? (
          <ContentLoader />
        ) : pending.length === 0 ? (
          <EmptyState title={t('linkRequest.noPending')} icon={UserPlus} />
        ) : (
          <div className="space-y-3">
            {pending.map((link) => {
              const isIncoming = link.requestedBy === 'parent';
              const other = link.parentId;
              return (
                <div key={link._id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <p className="font-semibold">{other?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isIncoming ? t('linkRequest.incomingFromParent') : t('linkRequest.waitingParent')}
                  </p>
                  {isIncoming && (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => handleRespond(link._id, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white">
                        {t('linkRequest.approve')}
                      </button>
                      <button type="button" onClick={() => handleRespond(link._id, 'reject')} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600">
                        {t('linkRequest.reject')}
                      </button>
                    </div>
                  )}
                  {!isIncoming && (
                    <button type="button" onClick={() => handleRespond(link._id, 'cancel')} className="mt-3 rounded-lg border px-3 py-1.5 text-sm">
                      {t('linkRequest.cancel')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
