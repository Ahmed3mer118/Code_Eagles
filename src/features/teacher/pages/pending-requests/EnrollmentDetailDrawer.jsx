// src/features/teacher/pages/pending-requests/EnrollmentDetailDrawer.jsx
import { X, User, Mail, Phone, Layers, Calendar, Package, FileText } from 'lucide-react';
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

export default function EnrollmentDetailDrawer({ open, onClose, enrollment }) {
  if (!open || !enrollment) return null;

  const student = enrollment.student || enrollment.user || {};
  const group = enrollment.group || {};
  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('ar-EG'); } catch { return '—'; }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            تفاصيل الطلب
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">
              {student.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {student.name || 'طالب غير معروف'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {student.email || '—'}
              </p>
            </div>
            <StatusBadge status={enrollment.status} size="md" />
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <Row icon={User} label="اسم الطالب" value={student.name} />
          <Row icon={Mail} label="البريد الإلكتروني" value={student.email} />
          <Row icon={Phone} label="رقم الهاتف" value={student.phoneNumber} />
          <Row icon={Layers} label="المجموعة" value={group.name} />
          <Row icon={Package} label="نوع الباقة" value={enrollment.packageType} />
          <Row icon={Calendar} label="تاريخ الطلب" value={formatDate(enrollment.createdAt)} />
          {enrollment.startDate && (
            <Row icon={Calendar} label="تاريخ البداية" value={formatDate(enrollment.startDate)} />
          )}
          {enrollment.endDate && (
            <Row icon={Calendar} label="تاريخ النهاية" value={formatDate(enrollment.endDate)} />
          )}
          {enrollment.notes && (
            <Row icon={FileText} label="ملاحظات" value={enrollment.notes} />
          )}
          {enrollment.rejectionReason && (
            <Row icon={FileText} label="سبب الرفض" value={enrollment.rejectionReason} />
          )}
        </div>
      </div>
    </div>
  );
}
