export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] p-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-20 bg-gray-300 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
            <div className="h-48 bg-gray-100 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
