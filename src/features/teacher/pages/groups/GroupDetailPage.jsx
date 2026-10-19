import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, UserCog, Settings } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import GroupStudentsTab from './GroupStudentsTab';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getGroup(id);
        setGroup(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  if (loading) {
    return <div className="p-6 animate-pulse bg-gray-200 h-40 rounded-xl" />;
  }

  if (!group) {
    return <div className="p-6 text-red-500">المجموعة غير موجودة</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/teacher/groups')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
          <p className="text-sm text-gray-500">
            المادة: {group.subject?.name} • المدرس: {group.teacher?.name}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-1 flex items-center gap-2 font-medium border-b-2 transition ${
              activeTab === 'students' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} /> الطلاب
          </button>
          <button
            onClick={() => setActiveTab('assistants')}
            className={`pb-3 px-1 flex items-center gap-2 font-medium border-b-2 transition ${
              activeTab === 'assistants' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCog size={18} /> المساعدين
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'students' && <GroupStudentsTab groupId={id} />}
        {activeTab === 'assistants' && (
          <div className="text-center py-8 text-gray-500">قريباً: إدارة المساعدين</div>
        )}
      </div>
    </div>
  );
}
