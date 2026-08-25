import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { platformSiteApi } from '../../../shared/api/platformApi';
import PageHeader from '../../../shared/ui/PageHeader';
import StatusBadge from '../../../shared/ui/StatusBadge';
import FormField from '../../../shared/ui/FormField';

const TABS = ['payment', 'backup'];

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PlatformCmsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('payment');
  const [site, setSite] = useState(null);
  const [backups, setBackups] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    vodafoneNumber: '',
    instapayId: '',
    bankDetails: '',
    paymentInstructions: '',
  });
  const [backupForm, setBackupForm] = useState({ frequency: 'weekly', customCron: '' });
  const [runningBackup, setRunningBackup] = useState(false);

  const load = async () => {
    const [data, backupData] = await Promise.all([
      platformSiteApi.getAdmin(),
      platformSiteApi.listBackups().catch(() => ({ backups: [] })),
    ]);
    setSite(data.site);
    setBackups(backupData.backups || []);
    setBackupForm({
      frequency: data.site?.backupSettings?.frequency || 'weekly',
      customCron: data.site?.backupSettings?.customCron || '',
    });
    setPaymentForm({
      vodafoneNumber: data.site?.platformPayment?.vodafoneNumber || data.paymentInfo?.vodafoneNumber || '',
      instapayId: data.site?.platformPayment?.instapayId || data.paymentInfo?.instapayId || '',
      bankDetails: data.site?.platformPayment?.bankDetails || data.paymentInfo?.bankDetails || '',
      paymentInstructions: data.site?.platformPayment?.paymentInstructions || data.paymentInfo?.paymentInstructions || '',
    });
  };

  useEffect(() => {
    load().catch((err) => toast.error(err?.message || t('common.error')));
  }, [t]);

  const savePlatformPayment = async () => {
    try {
      await platformSiteApi.updatePlatformPayment(paymentForm);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const saveBackupSettings = async () => {
    try {
      await platformSiteApi.updateBackupSettings(backupForm);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const runBackup = async () => {
    setRunningBackup(true);
    try {
      await platformSiteApi.runBackup();
      toast.success(t('admin.backupSuccess'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setRunningBackup(false);
    }
  };

  const downloadBackup = async (filename) => {
    try {
      const blob = await platformSiteApi.downloadBackup(filename);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.cmsTitle')} subtitle={t('admin.cmsSubtitle')} />

      <div className="flex flex-wrap gap-2 rounded-2xl bg-[var(--ce-bg)] p-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-[var(--ce-primary)] text-white shadow-sm' : 'text-[var(--ce-primary)] hover:bg-white'}`}
            onClick={() => setTab(key)}
          >
            {t(`admin.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'payment' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.platformPaymentTitle')}</h3>
          <p className="text-sm text-[var(--ce-muted)]">{t('admin.platformPaymentHint')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('settings.vodafoneNumber')}>
              <input className="ce-input" value={paymentForm.vodafoneNumber} onChange={(e) => setPaymentForm({ ...paymentForm, vodafoneNumber: e.target.value })} />
            </FormField>
            <FormField label={t('settings.instapayId')}>
              <input className="ce-input" value={paymentForm.instapayId} onChange={(e) => setPaymentForm({ ...paymentForm, instapayId: e.target.value })} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label={t('settings.bankDetails')}>
                <textarea className="ce-input min-h-[100px]" value={paymentForm.bankDetails} onChange={(e) => setPaymentForm({ ...paymentForm, bankDetails: e.target.value })} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label={t('settings.paymentInstructions')}>
                <textarea className="ce-input min-h-[100px]" value={paymentForm.paymentInstructions} onChange={(e) => setPaymentForm({ ...paymentForm, paymentInstructions: e.target.value })} />
              </FormField>
            </div>
          </div>
          <button type="button" className="ce-btn ce-btn-primary" onClick={savePlatformPayment}>
            {t('common.save')}
          </button>
        </div>
      )}

      {tab === 'backup' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="ce-card space-y-4 p-6">
            <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.backupTitle')}</h3>
            <p className="text-sm text-[var(--ce-muted)]">{t('admin.backupHint')}</p>
            <FormField label={t('admin.backupFrequency')} helper={t('admin.fieldBackupFreqHint')}>
              <select className="ce-input max-w-xs" value={backupForm.frequency} onChange={(e) => setBackupForm({ ...backupForm, frequency: e.target.value })}>
                <option value="daily">{t('admin.freq.daily')}</option>
                <option value="every_3_days">{t('admin.freq.every3')}</option>
                <option value="weekly">{t('admin.freq.weekly')}</option>
                <option value="monthly">{t('admin.freq.monthly')}</option>
                <option value="custom">{t('admin.freq.custom')}</option>
              </select>
            </FormField>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="ce-btn ce-btn-primary" onClick={saveBackupSettings}>
                {t('common.save')}
              </button>
              <button type="button" className="ce-btn ce-btn-accent" onClick={runBackup} disabled={runningBackup}>
                {runningBackup ? t('common.loading') : t('admin.runBackup')}
              </button>
            </div>
          </div>
          <div className="ce-card p-6">
            <h3 className="mb-4 font-bold text-[var(--ce-primary)]">{t('admin.lastBackup')}</h3>
            <div className="space-y-3">
              {(site?.backupLogs || []).slice(0, 5).map((log, i) => (
                <div key={i} className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{log.ranAt ? new Date(log.ranAt).toLocaleString() : '—'}</p>
                    <StatusBadge status={log.status === 'success' ? 'approved' : 'rejected'} label={log.status} />
                  </div>
                  {log.filename && (
                    <button type="button" className="ce-btn ce-btn-ghost mt-3 inline-flex items-center gap-1 text-xs" onClick={() => downloadBackup(log.filename)}>
                      <Download className="h-3.5 w-3.5" />
                      {t('admin.backupDownload')}
                    </button>
                  )}
                </div>
              ))}
              {backups.map((file) => (
                <div key={file.filename} className="flex items-center justify-between rounded-xl border border-[var(--ce-border)] p-3 text-sm">
                  <div>
                    <p className="font-semibold">{file.filename}</p>
                    <p className="text-[var(--ce-muted)]">{formatBytes(file.sizeBytes)}</p>
                  </div>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => downloadBackup(file.filename)}>
                    {t('admin.backupDownload')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
