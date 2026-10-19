// src/features/parent/components/EmptyChildState.jsx
import { Users, AlertCircle } from 'lucide-react';

export default function EmptyChildState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={36} className="text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا يوجد أبناء مسجلين</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        تأكد من ربط حسابك بحساب ابنك من قبل المدرس، أو تواصل مع إدارة الأكاديمية.
      </p>
    </div>
  );
}
