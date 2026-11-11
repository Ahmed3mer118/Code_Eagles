// src/features/teacher/pages/payments/PaymentRequestDetailDrawer.jsx
import {
  X,
  User,
  Mail,
  Phone,
  Layers,
  CreditCard,
  Calendar,
  Receipt,
  Tag,
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p
          className={`text-sm font-medium text-gray-900 dark:text-white break-words ${
            mono ? 'font-mono text-xs' : ''
          }`}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function PaymentRequestDetailDrawer({
  open,
  onClose,
  request,
  onApprove,
  onReject,
}) {
  if (!open || !request) return null;

  const student = request.student || {};
  const group = request.enrollment?.group || {};
  const plan = request.paymentPlan || {};
  const promo = request.promoCode || {};
  const method = request.metadata?.method;

  // ✅ الحقل اللي الباك بيحفظه فعليًا
  const proofImage =
    request.metadata?.proofImageUrl ||
    request.metadata?.receiptImageUrl ||
    request.proofImageUrl || // لو حطيناه حقل مباشر بعدين
    null;

  const fmt = (n) => {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('ar-EG') + ' ج.م';
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

  const isPending = request.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            تفاصيل الدفعة
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
                {student.name || 'غير معروف'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {student.email}
              </p>
            </div>
            <StatusBadge status={request.status} size="md" />
          </div>
        </div>

        {/* Amounts */}
        <div className="p-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">المبلغ الأصلي</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {fmt(request.originalAmount ?? request.amount)}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              المبلغ المدفوع
            </p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {fmt(request.amount)}
            </p>
          </div>
          {request.discountAmount > 0 && (
            <div className="col-span-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                الخصم
              </p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                - {fmt(request.discountAmount)}
              </p>
            </div>
          )}
        </div>

        {/* ✅ صورة التحويل — قسم بارز */}
        <div className="p-4 pt-0">
          {proofImage ? (
            <div className="rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-900/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 flex items-center gap-1">
                  <Receipt size={14} />
                  إثبات الدفع (صورة التحويل)
                </p>
                <div className="flex items-center gap-1">
                  <a
                    href={proofImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                    title="فتح في نافذة جديدة"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href={proofImage}
                    download
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                    title="تحميل الصورة"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
              <a
                href={proofImage}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={proofImage}
                  alt="إثبات الدفع"
                  className="w-full max-h-96 object-contain cursor-zoom-in"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML =
                      '<p class="p-4 text-center text-xs text-gray-500">تعذر تحميل الصورة</p>';
                  }}
                />
              </a>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                اضغط على الصورة لعرضها بالحجم الكامل
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                لم يتم إرفاق صورة تحويل لهذا الطلب
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 pt-0">
          <Row icon={User} label="اسم الطالب" value={student.name} />
          <Row icon={Mail} label="البريد الإلكتروني" value={student.email} />
          <Row icon={Phone} label="الهاتف" value={student.phoneNumber} />
          <Row icon={Layers} label="المجموعة" value={group.name} />
          <Row icon={CreditCard} label="خطة الدفع" value={plan.name} />
          {promo.code && (
            <Row icon={Tag} label="كود الخصم" value={promo.code} />
          )}
          <Row
            icon={Calendar}
            label="تاريخ الطلب"
            value={formatDate(request.createdAt)}
          />
          {method && (
            <Row icon={CreditCard} label="طريقة الدفع" value={method} />
          )}
          {request.metadata?.transactionId && (
            <Row
              icon={FileText}
              label="رقم العملية"
              value={request.metadata.transactionId}
              mono
            />
          )}
          {request.metadata?.referenceNumber && (
            <Row
              icon={FileText}
              label="رقم المرجع"
              value={request.metadata.referenceNumber}
              mono
            />
          )}
          {request.rejectionReason && (
            <Row
              icon={FileText}
              label="سبب الرفض"
              value={request.rejectionReason}
            />
          )}
        </div>

        {/* Actions (لو pending) */}
        {isPending && (onApprove || onReject) && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex gap-2">
            {onReject && (
              <button
                onClick={() => onReject(request)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                رفض
              </button>
            )}
            {onApprove && (
              <button
                onClick={() => onApprove(request)}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                قبول الدفعة
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
