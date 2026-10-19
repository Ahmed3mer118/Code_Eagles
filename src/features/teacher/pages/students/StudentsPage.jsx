// src/features/teacher/pages/students/StudentsPage.jsx
import { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  UserCog,
  Trash2,
  Users,
  AlertCircle,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import useStudents from '../../hooks/useStudents';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import StudentDetailDrawer from './StudentDetailDrawer';
import EditStudentStatusModal from './EditStudentStatusModal';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'suspended', label: 'موقوف' },
];

export default function StudentsPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    useStudents();

  const [detailTarget, setDetailTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (payload) => {
    setActionLoading(true);
    try {
      await teacherApi.updateMemberStatus(statusTarget.userId || statusTarget.id, payload);
      showToast('success', 'تم تحديث حالة الطالب');
      setStatusTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل تحديث الحالة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await teacherApi.removeMember(deleteTarget.userId || deleteTarget.id);
      showToast('success', 'تم حذف الطالب');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل حذف الطالب');
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
        title="الطلاب"
        subtitle={total > 0 ? `${total} طالب` : 'لا يوجد طلاب'}
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
            placeholder="ابحث بالاسم أو البريد..."
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
          icon={Users}
          title="لا يوجد طلاب"
          description="لم ينضم أي طالب بعد. سيظهر الطلاب هنا بعد الموافقة على طلبات الانضمام."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الهاتف</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">تاريخ الانضمام</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((student) => (
                  <tr
                    key={student.userId || student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {student.profileImageUrl ? (
                          <img
                            src={student.profileImageUrl}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {student.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
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
                      {student.phoneNumber || '—'}
                    </td>
                    <td className="p-3"><StatusBadge status={student.status} /></td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(student.joinedAt || student.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailTarget(student)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="عرض التفاصيل"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setStatusTarget(student)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          title="تغيير الحالة"
                        >
                          <UserCog size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.map((student) => (
              <div
                key={student.userId || student.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {student.profileImageUrl ? (
                      <img
                        src={student.profileImageUrl}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {student.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.name || 'غير معروف'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={student.status} />
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setDetailTarget(student)}
                    className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                  >
                    التفاصيل
                  </button>
                  <button
                    onClick={() => setStatusTarget(student)}
                    className="flex-1 py-1.5 bg-primary-600 text-white text-xs rounded-lg"
                  >
                    الحالة
                  </button>
                  <button
                    onClick={() => setDeleteTarget(student)}
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

      <StudentDetailDrawer
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        student={detailTarget}
      />
      <EditStudentStatusModal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleStatusChange}
        loading={actionLoading}
        student={statusTarget}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="حذف الطالب"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}" من الأكاديمية؟ لا يمكن التراجع.`}
        confirmLabel="نعم، احذف"
        variant="danger"
      />
    </div>
  );
}
