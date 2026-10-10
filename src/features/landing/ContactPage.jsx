import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-extrabold text-[#0B1F33]">تواصل معنا</h1>
        <p className="mt-4 text-gray-600">
          📧 contact@code-eagles.com
        </p>
        <p className="mt-2 text-gray-600">
          📱 +20 100 000 0000
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