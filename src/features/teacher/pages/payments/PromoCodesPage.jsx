// src/features/teacher/pages/payments/PromoCodesPage.jsx
import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import usePromoCodes from '../../hooks/usePromoCodes';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import PromoCodeFormModal from './PromoCodeFormModal';

function PromoStatusBadge({ promo }) {
  if (promo.status !== 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <XCircle size={12} /> غير نشط
      </span>
    );
  }
  const now = new Date();
  if (promo.validFrom && new Date(promo.validFrom) > now) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={12} /> لم يبدأ
      </span>
    );
  }
  if (promo.validUntil && new Date(promo.validUntil) < now) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} /> منتهي
      </span>
    );
  }
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} /> استُنفد
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={12} /> نشط
    </span>
  );
}

export default function PromoCodesPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    usePromoCodes();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
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
      if (editingPromo) {
        await teacherApi.updatePromoCode(editingPromo.id, payload);
        showToast('success', 'تم تحديث الكود');
      } else {
        await teacherApi.createPromoCode(payload);
        showToast('success', 'تم إنشاء الكود');
      }
      setFormOpen(false);
      setEditingPromo(null);
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
      await teacherApi.deletePromoCode(deleteTarget.id);
      showToast('success', 'تم حذف الكود');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل الحذف');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDiscount = (promo) => {
    if (promo.discountType === 'percentage') {
      return `${Number(promo.discountValue)}%`;
    }
    return `${Number(promo.discountValue).toLocaleString('ar-EG')} ج.م`;
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
        title="أكواد الخصم"
        subtitle={total > 0 ? `${total} كود` : 'لا توجد أكواد'}
        onRefresh={refetch}
        loading={loading}
        action={
          <button
            onClick={() => {
              setEditingPromo(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">كود جديد</span>
          </button>
        }
      />

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
          icon={Ticket}
          title="لا توجد أكواد خصم"
          description="ابدأ بإنشاء كود خصم لجذب الطلاب"
          actionLabel="إنشاء كود"
          onAction={() => {
            setEditingPromo(null);
            setFormOpen(true);
          }}
        />
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الكود</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الخصم</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الاستخدام</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((promo) => (
                  <tr
                    key={promo.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="p-3">
                      <span className="font-mono font-bold text-primary-600">
                        {promo.code}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                        {formatDiscount(promo)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 text-xs">
                      {promo.usedCount ?? 0}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                    </td>
                    <td className="p-3"><PromoStatusBadge promo={promo} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPromo(promo);
                            setFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(promo)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {data.map((promo) => (
              <div
                key={promo.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-primary-600 text-lg">
                    {promo.code}
                  </span>
                  <PromoStatusBadge promo={promo} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">الخصم:</span>
                  <span className="font-bold text-emerald-600">
                    {formatDiscount(promo)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>الاستخدام:</span>
                  <span>
                    {promo.usedCount ?? 0}
                    {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setEditingPromo(promo);
                      setFormOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-primary-600 text-white text-xs rounded-lg"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => setDeleteTarget(promo)}
                    className="flex-1 py-1.5 bg-red-600 text-white text-xs rounded-lg"
                  >
                    حذف
                  </button>
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

      <PromoCodeFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPromo(null);
        }}
        onSubmit={handleCreate}
        loading={actionLoading}
        promo={editingPromo}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="حذف الكود"
        message={`هل أنت متأكد من حذف الكود "${deleteTarget?.code}"؟`}
        confirmLabel="نعم، احذف"
        variant="danger"
      />
    </div>
  );
}
