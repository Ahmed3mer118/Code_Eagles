// src/features/parent/components/ChildSelector.jsx
import { Users } from 'lucide-react';
import useParentChildren from '../hooks/useParentChildren';

export default function ChildSelector({ selectedChildId, onSelect }) {
  const { children, loading } = useParentChildren();

  if (loading) return <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full max-w-sm" />;
  if (!children || children.length === 0) return null;

  // لو مفيش اختيار، نختار أول ابن تلقائياً
  if (!selectedChildId && children.length > 0) {
    setTimeout(() => onSelect(children[0].id), 0);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 flex items-center gap-3 max-w-sm">
      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
        <Users size={16} className="text-primary-600" />
      </div>
      <select
        value={selectedChildId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 bg-transparent text-sm font-medium focus:outline-none dark:text-white"
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name} {child.gradeLevel ? `- ${child.gradeLevel}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
