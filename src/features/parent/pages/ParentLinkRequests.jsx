// src/features/parent/pages/ParentLinkRequests.jsx
import { useState } from 'react';
import { Link as LinkIcon, Clock, CheckCircle2, XCircle, AlertCircle, Plus, X, Mail, Phone } from 'lucide-react';
import useParentRequests from '../hooks/useParentRequests';
import parentRequestsApi from '../api/requests.api';

export default function ParentLinkRequests() {
  const { requests, loading, error, refetch } = useParentRequests();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // حالة الفورم
  const [formData, setFormData] = useState({ studentEmail: '', studentPhone: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> مقبول</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md"><XCircle size={12}/> مرفوض</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Clock size={12}/> قيد المراجعة</span>;
    }
  };

  // إرسال طلب الربط
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.studentEmail && !formData.studentPhone) {
      setFormError('يجب إدخال البريد الإلكتروني أو رقم الهاتف الخاص بالطالب.');
      return;
    }

    setSubmitting(true);
    try {
      await parentRequestsApi.createRequest(formData);
      showToast('success', 'تم إرسال طلب الربط بنجاح، في انتظار موافقة المدرس.');
      setIsModalOpen(false);
      setFormData({ studentEmail: '', studentPhone: '' });
      refetch(); // تحديث القائمة
    } catch (err) {
      setFormError(err?.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LinkIcon size={24} className="text-primary-600" /> طلبات الربط
          </h1>
          <p className="text-sm text-gray-500 mt-1">ربط حسابك بحساب أبنائك لمتابعة أدائهم</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
        >
          <Plus size={16} /> طلب ربط جديد
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <LinkIcon size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد طلبات ربط</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">لم تقم بإرسال أي طلبات ربط حتى الآن.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} /> إرسال طلب
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {requests.map((req, idx) => (
            <div key={req.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">طالب: {req.student?.name || req.studentName}</h3>
                <p className="text-xs text-gray-500 mt-1">تاريخ الطلب: {new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                {req.rejectionReason && <p className="text-xs text-red-600 mt-1">سبب الرفض: {req.rejectionReason}</p>}
              </div>
              <div>{getStatusBadge(req.status)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: طلب ربط جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <LinkIcon size={18} className="text-primary-600" /> طلب ربط جديد
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg">{formError}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  البريد الإلكتروني للطالب
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
                  <input
                    type="email"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="text-center text-xs text-gray-500">أو</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم هاتف الطالب
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.studentPhone}
                    onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
