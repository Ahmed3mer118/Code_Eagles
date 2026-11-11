// src/features/teacher/pages/students/StudentDetailDrawer.jsx
import { 
  X, User, Mail, Phone, Calendar, BookOpen, Shield, 
  CreditCard, Users, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

function Row({ icon: Icon, label, value, color = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-medium break-words ${color}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function StudentDetailDrawer({ open, onClose, student }) {
  if (!open || !student) return null;

  // الـ enrollment اللي جاي من الباك
  const enrollment = student.enrollment;

  const formatDate = (d) => {
    if (!d) return '—';
    try { 
      return new Date(d).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
      }); 
    } catch { return '—'; }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col" dir="rtl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            تفاصيل الطالب
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-4">
            {student.profileImageUrl ? (
              <img
                src={student.profileImageUrl}
                alt={student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {student.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {student.name || 'طالب'}
              </p>
              <p className="text-sm text-gray-500 truncate mb-1">
                {student.email || '—'}
              </p>
              <StatusBadge status={student.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 flex-1">
          
          {/* البيانات الأساسية */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">البيانات الشخصية</h4>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2">
              <Row icon={User} label="الاسم بالكامل" value={student.name} />
              <Row icon={Mail} label="البريد الإلكتروني" value={student.email} />
              <Row icon={Phone} label="رقم الهاتف" value={student.phoneNumber} />
              <Row icon={Phone} label="رقم ولي الأمر" value={student.parentPhone} />
              <Row icon={BookOpen} label="الصف الدراسي" value={student.gradeLevel} />
              <Row icon={Calendar} label="تاريخ الانضمام" value={formatDate(student.joinedAt)} />
            </div>
          </div>

          {/* تفاصيل الاشتراك */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">تفاصيل الاشتراك</h4>
            {enrollment ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2">
                <Row 
                  icon={CreditCard} 
                  label="خطة الدفع" 
                  value={enrollment.planName || 'غير محدد'} 
                />
                <Row 
                  icon={Users} 
                  label="المجموعة" 
                  value={enrollment.groupName || 'غير محدد'} 
                />
                <Row 
                  icon={enrollment.status === 'active' ? CheckCircle2 : Clock} 
                  label="حالة الاشتراك" 
                  value={
                    enrollment.status === 'active' ? 'نشط' : 
                    enrollment.status === 'pending' ? 'قيد المراجعة' : 'ملغي'
                  }
                  color={
                    enrollment.status === 'active' ? 'text-green-600' :
                    enrollment.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                  }
                />
                {enrollment.endDate && (
                  <Row 
                    icon={Calendar} 
                    label="تاريخ انتهاء الاشتراك" 
                    value={formatDate(enrollment.endDate)} 
                  />
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-dashed border-gray-200 dark:border-gray-700">
                <AlertCircle size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">لا يوجد اشتراك مسجل لهذا الطالب</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
