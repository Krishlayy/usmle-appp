import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 bg-slate-900 relative overflow-hidden">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-40 pointer-events-none" 
             style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(15,23,42,0) 70%)' }}></div>
        
        <div className="z-10 max-w-4xl space-y-8 animate-in slide-in-from-bottom-8 duration-1000 fade-in">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            The next generation of medical education
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
            Master the USMLE,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              One Topic at a Time.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-300 leading-relaxed font-light">
            Stop paying for bloated, massive subscriptions. Build your own curriculum by purchasing premium, high-yield question banks specifically tailored for your weak spots in Step 1 and Step 2 CK.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)]"
            >
              Explore Question Banks
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:-translate-y-1"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full max-w-6xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left z-10">
          <div className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 backdrop-blur-sm transition-all hover:bg-slate-800 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">High-Yield Content</h3>
            <p className="text-slate-400 leading-relaxed">Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.</p>
          </div>
          <div className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 backdrop-blur-sm transition-all hover:bg-slate-800 hover:-translate-y-2 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-900/20">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
            <p className="text-slate-400 leading-relaxed">Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.</p>
          </div>
          <div className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 backdrop-blur-sm transition-all hover:bg-slate-800 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/20">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Pay Per Module</h3>
            <p className="text-slate-400 leading-relaxed">Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.</p>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-center text-sm text-slate-500">
        <p className="mb-2">© 2026 U-Micro Medical Education. Built for excellence.</p>
        <p className="text-slate-600 text-xs">USMLE® is a joint program of the FSMB and NBME, which neither sponsor nor endorse this product.</p>
      </footer>
    </div>
  );
}
