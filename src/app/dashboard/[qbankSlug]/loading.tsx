export default function QBankDashboardLoading() {
  return (
    <div className="px-5 py-12 md:px-10" role="status" aria-label="Loading question bank">
      <div className="mx-auto max-w-6xl motion-safe:animate-pulse">
        <div className="mb-10">
          <div className="mb-5 h-3 w-24 rounded-sm bg-slate-100" />
          <div className="h-10 w-2/3 max-w-lg rounded-sm bg-slate-100" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-sm bg-slate-100" />
        </div>
        <div className="mb-10 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-6 first:pl-0 md:px-8">
              <div className="h-3 w-20 rounded-sm bg-slate-100" />
              <div className="mt-3 h-8 w-16 rounded-sm bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-lg border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}