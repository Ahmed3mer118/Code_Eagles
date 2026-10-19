// src/features/teacher/pages/payments/PaymentHistoryPage.jsx
import { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  History,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import usePaymentRequests from '../../hooks/usePaymentRequests';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import PaymentRequestDetailDrawer from './PaymentRequestDetailDrawer';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'approved', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
];

export default function PaymentHistoryPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    usePaymentRequests();

  const [detailTarget, setDetailTarget] = useState(null);

  const fmt = (n) =>
    n === null || n === undefined
      ? '—'
      : Number(n).toLocaleString('ar-EG') + ' ج.م';

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // حساب الإحصائيات من البيانات الحالية (client-side)
  const approvedAmount = data
    .filter((r) => r.status === 'approved')
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const pendingAmount = data
    .filter((r) => r.status === 'pending')
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const approvedCount = data.filter((r) => r.status === 'approved').length;
  const pendingCount = data.filter((r) => r.status === 'pending').length;
  const rejectedCount = data.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-5" dir="rtl">
      <PageHeader
        title="سجل المدفوعات"
        subtitle={total > 0 ? `${total} دفعة` : 'لا توجد مدفوعات'}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500">المبلغ المقبول</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            {fmt(approvedAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs text-gray-500">المبلغ المعلق</span>
          </div>
          <p className="text-xl font-bold text-amber-600">
            {fmt(pendingAmount)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500">مقبولة</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {approvedCount}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-red-500" />
            <span className="text-xs text-gray-500">مرفوضة</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
          />
          <input
            type="text"
            value={params.search}
            onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
            placeholder="ابحث باسم الطالب..."
            className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={params.status}
            onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">جاري التحميل...</p>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={History}
          title="لا يوجد سجل مدفوعات"
          description="لم يتم تسجيل أي مدفوعات بعد"
        />
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((req) => {
                  const student = req.student || {};
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {student.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {student.name || 'غير معروف'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">
                        {fmt(req.amount)}
                      </td>
                      <td className="p-3"><StatusBadge status={req.status} /></td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setDetailTarget(req)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="عرض التفاصيل"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {data.map((req) => {
              const student = req.student || {};
              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {student.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">المبلغ:</span>
                    <span className="font-bold">{fmt(req.amount)}</span>
                  </div>
                  <button
                    onClick={() => setDetailTarget(req)}
                    className="w-full py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              );
            })}
          </div>

          <Pagination
            page={params.page}
            totalPages={totalPages}
            onChange={(p) => updateParams({ page: p })}
            loading={loading}
          />
        </>
      )}

      <PaymentRequestDetailDrawer
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        request={detailTarget}
      />
    </div>
  );
}
