'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-white text-black selection:bg-black selection:text-white">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        
        {/* HERO SECTION */}
        <div className="max-w-4xl w-full text-center space-y-8 py-32">
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Master the USMLE,<br/>
            <span className="text-gray-400">One Topic at a Time.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl md:text-2xl text-gray-500 font-light leading-snug">
            Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored for your weak spots.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-black px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-gray-800 rounded-none"
            >
              Explore Question Banks
            </Link>
            
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white border border-black px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-gray-100 rounded-none"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-5xl w-full py-24 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">High-Yield Content</h3>
              <p className="text-gray-500 leading-relaxed font-light">Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Advanced Analytics</h3>
              <p className="text-gray-500 leading-relaxed font-light">Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Pay Per Module</h3>
              <p className="text-gray-500 leading-relaxed font-light">Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
        <p className="mb-2">© 2026 U-Micro Medical Education.</p>
        <p className="text-xs">USMLE® is a joint program of the FSMB and NBME, which neither sponsor nor endorse this product.</p>
      </footer>
    </div>
  );
}
