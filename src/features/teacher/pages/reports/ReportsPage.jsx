// src/features/teacher/pages/reports/ReportsPage.jsx
import { useState } from 'react';
import {
  BarChart3,
  Layers,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import useReports from '../../hooks/useReports';
import PageHeader from '../../components/PageHeader';
import OverviewChartsTab from './OverviewChartsTab';
import GroupsChartsTab from './GroupsChartsTab';
import StudentsChartsTab from './StudentsChartsTab';

const TABS = [
  {
    id: 'overview',
    label: 'نظرة عامة',
    icon: BarChart3,
  },
  {
    id: 'groups',
    label: 'تحليلات المجموعات',
    icon: Layers,
  },
  {
    id: 'students',
    label: 'أداء الطلاب',
    icon: Users,
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    overview,
    groups,
    topStudents,
    enrollmentsByMonth,
    loading,
    error,
    refetch,
  } = useReports();

  return (
    <div className="space-y-5" dir="rtl">
      <PageHeader
        title="التقارير والتحليلات"
        subtitle="نظرة شاملة على أداء الأكاديمية"
        onRefresh={refetch}
        loading={loading}
        action={
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && !overview ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">جاري تحميل التقارير...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <OverviewChartsTab
              overview={overview}
              groups={groups}
              topStudents={topStudents}
              enrollmentsByMonth={enrollmentsByMonth}
            />
          )}
          {activeTab === 'groups' && <GroupsChartsTab groups={groups} />}
          {activeTab === 'students' && (
            <StudentsChartsTab initialStudents={topStudents} />
          )}
        </>
      )}
    </div>
  );
}
