import { Award } from 'lucide-react';

export default function StudentGrades() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Award size={24} /> الدرجات
      </h1>
      <p className="text-gray-500">هنا هتظهر درجاتك في كل مادة.</p>
    </div>
  );
}
