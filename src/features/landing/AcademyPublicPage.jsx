import { useParams, Link } from 'react-router-dom';

export default function AcademyPublicPage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-[#0B1F33]">
          صفحة الأكاديمية: {slug}
        </h1>
        <p className="mt-4 text-gray-600">
          🚧 قيد الإنشاء — هتظهر تفاصيل الأكاديمية هنا قريباً
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-[#0B1F33] px-5 py-2 text-white"
        >
          ← العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}