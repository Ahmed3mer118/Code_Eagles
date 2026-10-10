export default function LoadingScreen({ label = 'جاري التحميل...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}