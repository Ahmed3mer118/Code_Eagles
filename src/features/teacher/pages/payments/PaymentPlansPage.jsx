// src/features/teacher/pages/payments/PaymentPlansPage.jsx
import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  AlertCircle,
  Package,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import usePaymentPlans from '../../hooks/usePaymentPlans';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import PaymentPlanFormModal from './PaymentPlanFormModal';

const PACKAGE_LABELS = {
  monthly: 'شهري',
  term: 'ترم',
  yearly: 'سنوي',
  session: 'بالجلسة',
};

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'archived', label: 'مؤرشف' },
];

export default function PaymentPlansPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    usePaymentPlans();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (payload) => {
    setActionLoading(true);
    try {
      if (editingPlan) {
        await teacherApi.updatePaymentPlan(editingPlan.id, payload);
        showToast('success', 'تم تحديث الخطة');
      } else {
        await teacherApi.createPaymentPlan(payload);
        showToast('success', 'تم إنشاء الخطة');
      }
      setFormOpen(false);
      setEditingPlan(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل الحفظ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await teacherApi.deletePaymentPlan(deleteTarget.id);
      showToast('success', 'تم حذف الخطة');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل الحذف');
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (n) =>
    n === null || n === undefined
      ? '—'
      : Number(n).toLocaleString('ar-EG') + ' ج.م';

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
        title="خطط الدفع"
        subtitle={total > 0 ? `${total} خطة` : 'لا توجد خطط'}
        onRefresh={refetch}
        loading={loading}
        action={
          <button
            onClick={() => {
              setEditingPlan(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">خطة جديدة</span>
          </button>
        }
      />

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
            placeholder="ابحث باسم الخطة..."
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
          icon={CreditCard}
          title="لا توجد خطط دفع"
          description="ابدأ بإنشاء خطة دفع ليتمكن الطلاب من الاشتراك"
          actionLabel="إنشاء خطة"
          onAction={() => {
            setEditingPlan(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {PACKAGE_LABELS[plan.packageType] || plan.packageType}
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>

                {plan.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {fmt(plan.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.durationDays} يوم
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      title="تعديل"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(plan)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={params.page}
            totalPages={totalPages}
            onChange={(p) => updateParams({ page: p })}
            loading={loading}
          />
        </>
      )}

      <PaymentPlanFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPlan(null);
        }}
        onSubmit={handleCreate}
        loading={actionLoading}
        plan={editingPlan}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="حذف الخطة"
        message={`هل أنت متأكد من حذف خطة "${deleteTarget?.name}"؟`}
        confirmLabel="نعم، احذف"
        variant="danger"
      />
    </div>
  );
}
