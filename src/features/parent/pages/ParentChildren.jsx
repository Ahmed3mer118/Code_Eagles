// src/features/parent/pages/ParentChildren.jsx
import { Users, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import useParentChildren from '../hooks/useParentChildren';
import EmptyChildState from '../components/EmptyChildState';

export default function ParentChildren() {
  const { children, loading, error } = useParentChildren();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }
  if (children.length === 0) return <EmptyChildState />;

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={24} className="text-primary-600" /> أبنائي
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          قائمة أبنائك المسجلين في الأكاديمية
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <ChildCard key={child.linkId || child.id} child={child} />
        ))}
      </div>
    </div>
  );
}

/* ✅ كارت الطفل مع حالة الربط */
function ChildCard({ child }) {
  const status = child.linkStatus || 'pending';

  const statusMeta = {
    approved: {
      label: 'مقبول',
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    pending: {
      label: 'في انتظار موافقة المدرس',
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    rejected: {
      label: 'مرفوض',
      icon: XCircle,
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    blocked: {
      label: 'محظور',
      icon: AlertCircle,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
  };

  const meta = statusMeta[status] || statusMeta.pending;
  const StatusIcon = meta.icon;
  const isApproved = status === 'approved';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
          {child.profileImageUrl ? (
            <img
              src={child.profileImageUrl}
              alt={child.name}
              className="w-full h-full object-cover"
            />
          ) : (
            child.name?.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {child.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{child.email}</p>
        </div>
      </div>

      {child.gradeLevel && (
        <p className="text-sm text-gray-600 mb-1">الصف: {child.gradeLevel}</p>
      )}
      {child.phoneNumber && (
        <p className="text-sm text-gray-600 mb-1">الهاتف: {child.phoneNumber}</p>
      )}

      {/* ✅ شارة الحالة */}
      <div
        className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${meta.bg} ${meta.text} border ${meta.border}`}
      >
        <StatusIcon size={14} />
        <span>{meta.label}</span>
      </div>

      {/* ✅ رسالة تنبيه لو مش مقبول */}
      {!isApproved && status === 'pending' && (
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
          لا يمكنك الاطلاع على تفاصيل الطفل حتى يوافق المدرس على طلب الربط.
        </p>
      )}
    </div>
  );
}
