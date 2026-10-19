// src/features/teacher/pages/pending-requests/PendingRequestsPage.jsx
import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import useEnrollments from '../../hooks/useEnrollments';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ApproveModal from './ApproveModal';
import RejectModal from './RejectModal';
import EnrollmentDetailDrawer from './EnrollmentDetailDrawer';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'approved', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function PendingRequestsPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    useEnrollments({ status: 'pending' });

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (payload) => {
    setActionLoading(true);
    try {
      await teacherApi.approveEnrollment(approveTarget.id, payload);
      showToast('success', 'تم قبول الطلب بنجاح');
      setApproveTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل قبول الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (payload) => {
    setActionLoading(true);
    try {
      await teacherApi.rejectEnrollment(rejectTarget.id, payload);
      showToast('success', 'تم رفض الطلب');
      setRejectTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل رفض الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('ar-EG'); } catch { return '—'; }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-white text-sm shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {toast.text}
        </div>
      )}

      <PageHeader
        title="طلبات الانضمام المعلقة"
        subtitle={total > 0 ? `${total} طلب` : 'لا توجد طلبات'}
        onRefresh={refetch}
        loading={loading}
      />

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
            placeholder="ابحث باسم أو بريد الطالب..."
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
          icon={Clock}
          title="لا توجد طلبات"
          description="جميع الطلبات تمت معالجتها، أو لا توجد طلبات جديدة حالياً"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">المجموعة</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((item) => {
                  const student = item.student || item.user || {};
                  const isPending = item.status === 'pending';
                  return (
                    <tr
                      key={item.id}
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
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        {item.group?.name || '—'}
                      </td>
                      <td className="p-3"><StatusBadge status={item.status} /></td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailTarget(item)}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="عرض التفاصيل"
                          >
                            <Eye size={16} />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => setApproveTarget(item)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                title="موافقة"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setRejectTarget(item)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="رفض"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.map((item) => {
              const student = item.student || item.user || {};
              const isPending = item.status === 'pending';
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {student.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {student.name || 'غير معروف'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>{item.group?.name || 'بدون مجموعة'}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setDetailTarget(item)}
                      className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                    >
                      التفاصيل
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => setApproveTarget(item)}
                          className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded-lg"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => setRejectTarget(item)}
                          className="flex-1 py-1.5 bg-red-600 text-white text-xs rounded-lg"
                        >
                          رفض
                        </button>
                      </>
                    )}
                  </div>
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

      <ApproveModal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onSubmit={handleApprove}
        loading={actionLoading}
        enrollment={approveTarget}
      />
      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleReject}
        loading={actionLoading}
        enrollment={rejectTarget}
      />
      <EnrollmentDetailDrawer
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        enrollment={detailTarget}
      />
    </div>
  );
}
