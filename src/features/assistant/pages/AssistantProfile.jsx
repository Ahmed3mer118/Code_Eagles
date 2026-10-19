// src/features/assistant/pages/AssistantProfile.jsx
import { useState } from 'react';
import { User, Shield } from 'lucide-react';
import AssistantProfileTab from './AssistantProfileTab';
import AssistantSecurityTab from './AssistantSecurityTab';

export default function AssistantProfile() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'بياناتي', icon: User },
    { id: 'security', label: 'الأمان', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User size={24} className="text-primary-600" />
          الملف الشخصي
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة معلوماتك الشخصية وإعدادات الأمان
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === 'profile' && <AssistantProfileTab />}
        {activeTab === 'security' && <AssistantSecurityTab />}
      </div>
    </div>
  );
}
