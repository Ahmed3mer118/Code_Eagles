// src/features/teacher/pages/points/PointsPage.jsx
import { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertCircle,
  Award,
  Eye,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import usePoints from '../../hooks/usePoints';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import AddPointsModal from './AddPointsModal';
import StudentPointsDrawer from './StudentPointsDrawer';

const SOURCE_OPTIONS = [
  { value: '', label: 'كل المصادر' },
  { value: 'manual', label: 'يدوي' },
  { value: 'attendance', label: 'حضور' },
  { value: 'assignment', label: 'واجب' },
  { value: 'quiz', label: 'اختبار' },
  { value: 'participation', label: 'مشاركة' },
];

function computeStats(items) {
  let totalAdded = 0;
  let totalDeducted = 0;
  const studentsSet = new Set();

  items.forEach((it) => {
    const pts = Number(it.points || 0);
    if (pts > 0) totalAdded += pts;
    else totalDeducted += Math.abs(pts);
    if (it.studentId) studentsSet.add(it.studentId);
  });

  return {
    totalAdded,
    totalDeducted,
    net: totalAdded - totalDeducted,
    studentsCount: studentsSet.size,
  };
}

export default function PointsPage() {
  const { data, total, totalPages, params, loading, error, refetch, updateParams } =
    usePoints();

  const [addOpen, setAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [drawerStudent, setDrawerStudent] = useState(null);

  const stats = computeStats(data);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (payload) => {
    setActionLoading(true);
    try {
      const res = await teacherApi.addPoints(payload);
      const recipients = res?.data?.recipients ?? res?.recipients ?? 0;
      showToast(
        'success',
        `تم منح النقاط لـ ${recipients} طالب بنجاح`,
      );
      setAddOpen(false);
      refetch();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'فشل حفظ النقاط');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
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
        title="النقاط"
        subtitle="إدارة نقاط التحفيز للطلاب"
        onRefresh={refetch}
        loading={loading}
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">إضافة نقاط</span>
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">إجمالي المضافة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            +{stats.totalAdded}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">إجمالي المخصوم</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <TrendingDown className="text-red-600" size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            -{stats.totalDeducted}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">صافي النقاط</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Star className="text-primary-600" size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.net >= 0 ? '+' : ''}
            {stats.net}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">الطلاب المشاركون</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Award className="text-indigo-600" size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.studentsCount}
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
            value={params.search || ''}
            onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
            placeholder="ابحث بسبب العملية..."
            className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={params.source}
            onChange={(e) => updateParams({ source: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {SOURCE_OPTIONS.map((o) => (
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
          icon={Award}
          title="لا توجد نقاط بعد"
          description="ابدأ بإضافة نقاط للطلاب لتحفيزهم على الأداء الممتاز"
          actionLabel="إضافة نقاط"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">النقاط</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">السبب</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">المصدر</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                  <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((item, idx) => {
                  const student = item.student || {};
                  const pts = Number(item.points || 0);
                  const isPositive = pts > 0;
                  return (
                    <tr
                      key={item.id || idx}
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
                              {student.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {pts}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.reason || '—'}
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {item.source || '—'}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-3">
                        {student.id && (
                          <button
                            onClick={() =>
                              setDrawerStudent({
                                id: student.id,
                                name: student.name,
                              })
                            }
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="عرض نقاط الطالب"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.map((item, idx) => {
              const student = item.student || {};
              const pts = Number(item.points || 0);
              const isPositive = pts > 0;
              return (
                <div
                  key={item.id || idx}
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
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-lg shrink-0 ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {pts}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.reason}
                  </p>
                  {student.id && (
                    <button
                      onClick={() =>
                        setDrawerStudent({
                          id: student.id,
                          name: student.name,
                        })
                      }
                      className="w-full py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                    >
                      عرض نقاط الطالب
                    </button>
                  )}
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

      <AddPointsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        loading={actionLoading}
      />
      <StudentPointsDrawer
        open={!!drawerStudent}
        onClose={() => setDrawerStudent(null)}
        studentId={drawerStudent?.id}
        studentName={drawerStudent?.name}
      />
    </div>
  );
}
