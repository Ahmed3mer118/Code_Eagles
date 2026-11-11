import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await teacherApi.getSubject(id);
        if (mounted) setSubject(res.data?.data || res.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-500">جاري التحميل...</div>;
  if (!subject) return <div className="p-6 text-center text-red-500">المادة غير موجودة</div>;

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => navigate('/teacher/subjects')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowRight size={18} /> {t('common.back') || 'رجوع'}
      </button>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{subject.name}</h1>
            <p className="text-sm text-gray-500">{subject.gradeLevel || 'غير محدد'}</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{subject.description || 'لا يوجد وصف'}</p>
      </div>
    </div>
  );
}
