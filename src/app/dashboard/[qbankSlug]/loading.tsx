export default function QBankDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] font-sans animate-pulse">
      <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl">
        {/* Header Section Skeleton */}
        <div className="mb-10">
          <div className="h-4 w-24 bg-gray-200 rounded mb-6"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-9 w-64 bg-gray-200 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
              </div>
              <div className="h-5 w-full max-w-xl bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Top Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-40 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-auto flex items-baseline gap-2">
                <div className="h-10 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="mb-12">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-72 bg-gray-100 rounded-lg"></div>
          </div>
        </div>

        {/* Study Tools Skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 h-48 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              </div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
