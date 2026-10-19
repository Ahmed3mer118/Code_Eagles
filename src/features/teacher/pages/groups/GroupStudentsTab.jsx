import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import AddStudentToGroupModal from './AddStudentToGroupModal';

export default function GroupStudentsTab({ groupId }) {
  const { t } = useI18n();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getGroupStudents(groupId);
      setStudents(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [groupId]);

  const handleRemove = async (studentId) => {
    if (!window.confirm('هل أنت متأكد من إزالة هذا الطالب؟')) return;
    try {
      await teacherApi.removeGroupStudent(groupId, studentId);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">طلاب المجموعة</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-primary-700"
        >
          <Plus size={16} /> إضافة طالب
        </button>
      </div>

      {loading ? (
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
          لا يوجد طلاب في هذه المجموعة
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-start">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-start">الاسم</th>
                <th className="p-3 text-start">البريد</th>
                <th className="p-3 text-start">الحالة</th>
                <th className="p-3 text-start">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {students.map((s) => (
                <tr key={s.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-gray-500">{s.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      s.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleRemove(s.studentId)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AddStudentToGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          groupId={groupId}
          currentStudentIds={students.map((s) => s.studentId)}
          onSuccess={fetchStudents}
        />
      )}
    </div>
  );
}
