export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans animate-pulse">
      {/* Top Navbar Skeleton */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 md:px-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          
          {/* Greeting & Stat Bar Skeleton */}
          <section className="flex flex-col gap-6">
            <div>
              <div className="h-9 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 w-80 bg-gray-200 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Active Subscriptions Skeleton */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <article key={i} className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-64">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded ml-auto"></div>
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg mt-2"></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
