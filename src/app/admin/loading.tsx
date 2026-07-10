export default function AdminLoading() {
  return (
    <div className="animate-pulse flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="space-y-4">
          <div className="h-8 bg-slate-100 rounded w-full"></div>
          <div className="h-16 bg-slate-100 rounded w-full"></div>
          <div className="h-16 bg-slate-100 rounded w-full"></div>
          <div className="h-16 bg-slate-100 rounded w-full"></div>
          <div className="h-16 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
