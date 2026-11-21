export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white" role="status" aria-label="Loading dashboard">
      <div className="flex-1 px-5 pb-20 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 motion-safe:animate-pulse">
          <section className="flex flex-col gap-10">
            <div>
              <div className="mb-4 h-3 w-24 rounded-sm bg-slate-100" />
              <div className="h-12 w-3/4 max-w-xl rounded-sm bg-slate-100" />
              <div className="mt-5 h-4 w-80 max-w-full rounded-sm bg-slate-100" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-6 first:pl-0 md:px-8">
                  <div className="h-3 w-20 rounded-sm bg-slate-100" />
                  <div className="mt-3 h-8 w-16 rounded-sm bg-slate-100" />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex h-64 flex-col justify-between rounded-lg border border-slate-200 bg-slate-100 p-6">
                <div>
                  <div className="h-3 w-24 rounded-sm bg-slate-100" />
                  <div className="mt-4 h-6 w-3/4 rounded-sm bg-slate-100" />
                </div>
                <div className="space-y-4">
                  <div className="h-px w-full bg-slate-100" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 rounded-md bg-slate-100" />
                    <div className="h-10 rounded-md bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}