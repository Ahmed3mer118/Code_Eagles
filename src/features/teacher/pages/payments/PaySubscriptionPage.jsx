import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformSubscription } from '../../hooks/usePlatformSubscription';

export default function PaySubscriptionPage() {
  const {
    history,
    loading,
    actionLoading,
    error,
    uploadAndSubmitProof,
  } = usePlatformSubscription();

  const [successMsg, setSuccessMsg] = useState('');
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // بنجيب الطلبات اللي حالتها pending أو under_review
  const pendingRequests = history.filter(
    (req) => req.status === 'pending' || req.status === 'under_review'
  );

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      alert('يرجى اختيار صورة فقط');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e, subscriptionId) => {
    e.preventDefault();
    if (!subscriptionId || !file) return;

    const res = await uploadAndSubmitProof(subscriptionId, file);
    if (res.success) {
      setSuccessMsg('تم رفع إثبات الدفع بنجاح، وسيتم مراجعته قريباً.');
      setFile(null);
      setPreview(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const openUploadForm = (subId) => {
    setActiveUploadId(subId);
    setFile(null);
    setPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">دفع اشتراك المنصة</h1>
        <p className="text-gray-500">
          اختر الطلب الذي تريد رفع إثبات الدفع له.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
          {successMsg}
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800 font-bold mb-2 text-lg">لا توجد طلبات اشتراك معلقة</p>
          <p className="text-yellow-700 text-sm mb-4">
            اشتراكك الحالي مفعل، أو لا يوجد لديك طلبات قيد الانتظار تحتاج لرفع إيصال.
          </p>
          <Link
            to="/teacher/subscription"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تصفح الباقات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold mb-3 text-gray-700">طلباتك المعلقة:</h2>
          
          {pendingRequests.map((req) => (
            <div key={req.id} className="bg-white border rounded-xl p-5 shadow-sm">
              {/* تفاصيل الطلب */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-gray-500 block mb-1">الباقة</span>
                  <span className="font-bold text-blue-700 text-base">{req.plan}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">المبلغ</span>
                  <span className="font-bold text-base">{req.amount} ج.م</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">الحالة</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {req.status === 'pending' ? 'في انتظار الموافقة' : 'قيد المراجعة'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">تاريخ الطلب</span>
                  <span className="font-bold text-base">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              {/* ملاحظات الرفض لو موجودة */}
              {req.paymentStatus === 'rejected' && req.rejectionReason && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                  <span className="font-bold">تم رفض الإيصال السابق: </span>
                  {req.rejectionReason}
                </div>
              )}

              {/* فورم رفع الصورة للطلب ده */}
              {activeUploadId === req.id ? (
                <form onSubmit={(e) => handleSubmit(e, req.id)} className="space-y-3 mt-4 border-t pt-4">
                  <label className="block text-sm font-medium">صورة إثبات الدفع</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {preview && (
                    <div className="border rounded-lg p-2 bg-gray-50 max-w-sm">
                      <img src={preview} alt="معاينة" className="max-h-48 mx-auto rounded" />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={actionLoading || !file}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                      {actionLoading ? 'جارٍ الرفع...' : 'تأكيد ورفع'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUploadId(null)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-2">
                  {/* ✅ لو الإيصال قيد المراجعة، نعرض رسالة. لو مرفوض أو لسه مرفوعش، نعرض زرار الرفع */}
                  {req.paymentStatus === 'under_review' ? (
                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
                      تم رفع الإيصال، وهو الآن قيد المراجعة من الإدارة.
                    </div>
                  ) : (
                    <button
                      onClick={() => openUploadForm(req.id)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      {req.paymentStatus === 'rejected' ? 'إعادة رفع إثبات الدفع' : 'رفع إثبات الدفع لهذه الباقة'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
