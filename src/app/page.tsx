'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="flex flex-col min-h-[200vh] bg-[#020617] text-white selection:bg-blue-500/30" ref={containerRef}>
      
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <main className="flex-1 flex flex-col z-10">
        
        {/* HERO SECTION */}
        <motion.div 
          className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-20"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-blue-200 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-3 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
            The Next Generation of Medical Education
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl"
          >
            Master the USMLE,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
              One Topic at a Time.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-2xl mt-8 text-xl md:text-2xl text-slate-400 font-light leading-relaxed"
          >
            Stop paying for bloated subscriptions. Build your own curriculum with premium, high-yield question banks tailored for your weak spots.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 w-full max-w-md mx-auto"
          >
            <Link
              href="/store"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative flex items-center">
                Explore Question Banks
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </Link>
            
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-transparent border border-slate-700 px-8 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-white/5 hover:border-slate-500 active:scale-95"
            >
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D MOCKUP & FEATURES SECTION */}
        <div className="py-32 px-4 max-w-7xl mx-auto w-full relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, rotateX: 20, y: 100 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            style={{ perspective: 1000 }}
            className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-2xl shadow-2xl mb-32 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 mix-blend-overlay"></div>
            
            {/* Mock Dashboard UI */}
            <div className="rounded-xl border border-white/5 bg-[#0a0f1c] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Fake Window Header */}
              <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <div className="h-48 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-white/5 flex items-end p-4">
                    {/* Fake Chart Bars */}
                    <div className="w-full flex justify-between items-end gap-2 h-full pt-8">
                      {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="w-full bg-blue-500/40 rounded-t-sm"
                        ></motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 rounded-lg bg-white/5 border border-white/5 p-4 flex flex-col justify-center">
                      <div className="text-slate-400 text-sm mb-1">Average Score</div>
                      <div className="text-3xl font-bold text-emerald-400">78.4%</div>
                    </div>
                    <div className="h-32 rounded-lg bg-white/5 border border-white/5 p-4 flex flex-col justify-center">
                      <div className="text-slate-400 text-sm mb-1">Questions Completed</div>
                      <div className="text-3xl font-bold text-white">1,204</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 space-y-6">
                  <div className="h-full rounded-lg bg-white/5 border border-white/5 p-6">
                    <div className="text-lg font-bold mb-6 border-b border-white/10 pb-2">Weakest Areas</div>
                    <ul className="space-y-4">
                      {['Cardiology', 'Renal', 'Neurology', 'Endocrine'].map((topic, i) => (
                        <li key={topic} className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">{topic}</span>
                          <span className="text-sm font-mono text-red-400">{40 + i * 5}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: 'High-Yield Content',
                desc: 'Questions crafted by top scorers, focusing on the concepts most frequently tested on the boards. No low-yield fluff.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                color: 'blue'
              },
              {
                title: 'Advanced Analytics',
                desc: 'Track your performance across micro-topics to identify weaknesses and optimize your study time efficiently.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                color: 'indigo'
              },
              {
                title: 'Pay Per Module',
                desc: 'Zero subscriptions. Lifetime access to the modules you buy. A fair marketplace built for medical students.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                color: 'emerald'
              }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className="group relative rounded-3xl bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] transition-colors duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{feature.icon}</svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-lg py-12 text-center text-sm text-slate-500 mt-auto">
        <p className="mb-2">© 2026 U-Micro Medical Education. Built for excellence.</p>
        <p className="text-slate-600 text-xs">USMLE® is a joint program of the FSMB and NBME, which neither sponsor nor endorse this product.</p>
      </footer>

      {/* Global CSS for custom animations that Tailwind doesn't have built-in */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}
