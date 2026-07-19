export default function Loading() {
  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* The 'R' Logo/Animation */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden shadow-lg animate-pulse-scale">
          <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
          <span className="text-4xl font-extrabold text-primary font-sans relative z-10">R</span>
        </div>
        <p className="mt-6 text-slate-500 font-medium tracking-widest uppercase text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
