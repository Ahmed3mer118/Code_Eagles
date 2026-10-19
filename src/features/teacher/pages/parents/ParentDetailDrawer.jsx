// src/features/teacher/pages/parents/ParentDetailDrawer.jsx
import { X, User, Mail, Phone, Users, Calendar, FileText } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function ParentDetailDrawer({ open, onClose, link }) {
  if (!open || !link) return null;

  const parent = link.parent || { name: link.parentName, email: link.parentEmail };
  const child = link.child || link.student || {};
  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('ar-EG'); } catch { return '—'; }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            تفاصيل ولي الأمر
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
              {parent.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {parent.name || 'ولي أمر'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {parent.email || '—'}
              </p>
            </div>
            <StatusBadge status={link.status} size="md" />
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">بيانات ولي الأمر</p>
          <Row icon={User} label="الاسم" value={parent.name} />
          <Row icon={Mail} label="البريد الإلكتروني" value={parent.email} />
          <Row icon={Phone} label="رقم الهاتف" value={parent.phoneNumber} />

          <p className="text-xs font-bold text-gray-400 uppercase mt-4 mb-2">الطالب المرتبط</p>
          <Row icon={Users} label="اسم الطالب" value={child.name} />
          <Row icon={Mail} label="بريد الطالب" value={child.email} />

          <p className="text-xs font-bold text-gray-400 uppercase mt-4 mb-2">بيانات الربط</p>
          <Row icon={Calendar} label="تاريخ الطلب" value={formatDate(link.createdAt)} />
          {link.reviewedAt && (
            <Row icon={Calendar} label="تاريخ المراجعة" value={formatDate(link.reviewedAt)} />
          )}
          {link.reason && (
            <Row icon={FileText} label="السبب" value={link.reason} />
          )}
        </div>
      </div>
    </div>
  );
}
