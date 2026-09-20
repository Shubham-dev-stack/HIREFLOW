import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Zap, 
  Play,
  Layers,
  Search,
  UserCheck
} from 'lucide-react';

const Orb = React.lazy(() => import('./Orb'));

export const LandingPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  // Mouse spotlight state
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Section 1 Stat Chips Count-Up Hook
  const [statScoreA, setStatScoreA] = useState(0);
  const [statScoreB, setStatScoreB] = useState(0);
  const [statMinutes, setStatMinutes] = useState(0);
  const [statDecisions, setStatDecisions] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setStatScoreA(Math.floor(easeProgress * 62));
      setStatScoreB(Math.floor(easeProgress * 84));
      setStatMinutes(Math.floor(easeProgress * 5));
      setStatDecisions(0);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setStatScoreA(62);
        setStatScoreB(84);
        setStatMinutes(5);
        setStatDecisions(0);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Section 5 The Moment State & Triggers
  const momentRef = useRef<HTMLDivElement>(null);
  const isMomentInView = useInView(momentRef, { once: true, margin: '-100px' });
  const [momentScore, setMomentScore] = useState(62);
  const [showDeltaBadge, setShowDeltaBadge] = useState(false);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);

  useEffect(() => {
    if (!isMomentInView) return;

    let start: number | null = null;
    const duration = 800;

    const animateNumber = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(62 + easeProgress * (84 - 62));
      setMomentScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setMomentScore(84);
        // Sequential triggers
        setTimeout(() => setShowDeltaBadge(true), 100);
        setTimeout(() => setShowLine1(true), 300);
        setTimeout(() => setShowLine2(true), 500);
        setTimeout(() => setShowLine3(true), 700);
      }
    };

    const animId = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animId);
  }, [isMomentInView]);

  // Motion variants with reduced-motion support
  const fadeInVariant: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: 'easeOut' } 
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090C] text-[#F8FAFC] font-sans antialiased overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200 relative">
      {/* Cursor Spotlight */}
      <div 
        className="fixed pointer-events-none z-30 transition-opacity duration-300"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          width: '400px',
          height: '400px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Persistent Minimal Header */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-[#07090C]/80 backdrop-blur-md border-b border-[#1E2530]/60 z-40 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={18} />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-mono">
            HireFlow
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold ml-1">
            v2.0
          </span>
        </div>

        <Link
          to="/app"
          className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#07090C] text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 font-mono"
        >
          <span>Launch Workspace</span>
          <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ========================================================================= */}
      {/* SECTION 1 — HERO (100vh, Centered with WebGL Orb Background) */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background WebGL Orb (Centered, non-blocking) */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] pointer-events-none z-0 opacity-75"
        >
          <Suspense fallback={<div className="w-full h-full rounded-full bg-emerald-500/5 animate-pulse" />}>
            <Orb
              hue={150}
              hoverIntensity={0.45}
              rotateOnHover={true}
              backgroundColor="#07090C"
            />
          </Suspense>
        </div>

        {/* Hero Content (Positioned over Orb) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-7">
          {/* Hackathon Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 shadow-inner backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agentic AI Hackathon 2026 · Product Space</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#F8FAFC] tracking-tight font-semibold leading-[1.08] max-w-3xl"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 4.8rem)' }}
          >
            Before you decide, do you have enough evidence?
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-relaxed max-w-[600px] font-sans"
          >
            HireFlow doesn't score candidates. It checks whether a hiring decision is supported by evidence — and generates the smallest validation that closes the biggest gap.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#07090C] text-sm font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-1.5 font-mono cursor-pointer"
            >
              <span>Launch Decision Room</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-[#111318] hover:bg-[#1E2530] text-[#94A3B8] hover:text-white border border-[#1E2530] text-sm font-medium px-6 py-3.5 rounded-xl transition-all duration-200 font-mono"
            >
              <Play size={14} className="text-emerald-400" />
              <span>Watch 3-min demo</span>
            </button>
          </motion.div>

          {/* Stat Chips (Animated Count-Up) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-6 text-xs font-mono text-[#94A3B8]"
          >
            <div className="px-4 py-2 rounded-lg bg-[#111318]/90 border border-[#1E2530] flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">
                {statScoreA}% → {statScoreB}%
              </span>
              <span className="text-slate-400">Readiness Delta</span>
            </div>

            <div className="px-4 py-2 rounded-lg bg-[#111318]/90 border border-[#1E2530] flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">
                {statMinutes}-min
              </span>
              <span className="text-slate-400">Targeted Validation</span>
            </div>

            <div className="px-4 py-2 rounded-lg bg-[#111318]/90 border border-[#1E2530] flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {statDecisions}
              </span>
              <span className="text-slate-400">Autonomous Decisions</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — THE PROBLEM (3 Cards, Scroll Reveal) */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            The Fundamental Problem
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            Hiring tools rank candidates. They don't check evidence.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'prob-1',
              icon: Layers,
              title: 'Signal Overload',
              body: 'AI can now generate more hiring signals than teams can confidently validate.'
            },
            {
              id: 'prob-2',
              icon: Search,
              title: 'Opaque Match Scores',
              body: "A 92% match score doesn't tell you what evidence is missing."
            },
            {
              id: 'prob-3',
              icon: HelpCircle,
              title: 'The Unknown Fallacy',
              body: "No evidence is silently treated as weak evidence. It shouldn't be."
            }
          ].map((card, idx) => (
            <motion.div
              key={card.id}
              variants={fadeInVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.12 }}
              className="bg-[#111318] border border-[#1E2530] rounded-xl p-6 space-y-4 hover:border-slate-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <card.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight font-mono">
                {card.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — THE SHIFT (Two Columns with Emerald Left Glow) */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-5xl mx-auto space-y-12 border-t border-[#1E2530]/60">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            The Paradigm Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            From scoring candidates to qualifying decisions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Column */}
          <motion.div
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-[#111318] border border-[#1E2530] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Every other tool asks
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 font-sans tracking-tight">
                "How good is this candidate?"
              </div>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed pt-4 border-t border-slate-800">
              Assumes opaque match scores, hallucinated resumes, and subjective keyword match percentages.
            </p>
          </motion.div>

          {/* Right Column (Emerald Glow) */}
          <motion.div
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="p-8 rounded-2xl bg-[#111318] border border-emerald-500/40 border-l-4 border-l-emerald-500 flex flex-col justify-between space-y-6"
            style={{
              boxShadow: '-4px 0 24px rgba(16,185,129,0.2)'
            }}
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} />
                HireFlow asks
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                "Is this decision supported yet?"
              </div>
            </div>
            <p className="text-xs font-mono text-emerald-300 leading-relaxed pt-4 border-t border-emerald-500/20">
              Evaluates evidentiary sufficiency, flags critical uncertainties, and targets the highest-ROI validation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — THE LOOP (Horizontal Agentic Loop) */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-6xl mx-auto space-y-14 border-t border-[#1E2530]/60">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Agentic Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            The 6-Step Decision Validation Loop
          </h2>
        </div>

        {/* Desktop Animated Horizontal Node Flow */}
        <div className="hidden lg:flex items-center justify-between relative px-4">
          {[
            { id: '1', name: 'OBSERVE', desc: 'Ingest & audit' },
            { id: '2', name: 'IDENTIFY UNCERTAINTY', desc: 'Isolate gaps' },
            { id: '3', name: 'ACT', desc: 'Target highest ROI' },
            { id: '4', name: 'COLLECT EVIDENCE', desc: 'Targeted scenario' },
            { id: '5', name: 'RE-EVALUATE', desc: 'Dynamic Δ calculation' },
            { id: '6', name: 'HUMAN DECIDES', desc: 'Final finality', isFinal: true }
          ].map((node, idx, arr) => (
            <React.Fragment key={node.id}>
              {/* Node Circle & Label */}
              <div className="flex flex-col items-center text-center space-y-2 relative z-10">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  node.isFinal
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-4 ring-emerald-500/20 scale-110'
                    : 'bg-[#111318] text-slate-300 border-[#1E2530]'
                }`}>
                  {idx + 1}
                </div>
                <span className={`font-mono text-xs font-bold tracking-tight ${
                  node.isFinal ? 'text-emerald-400 text-sm' : 'text-slate-300'
                }`}>
                  {node.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {node.desc}
                </span>
              </div>

              {/* Connecting animated line */}
              {idx < arr.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-800 mx-2 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-400"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile/Tablet Vertical Stack */}
        <div className="lg:hidden space-y-4 font-mono text-xs">
          {[
            { id: '1', name: 'OBSERVE', desc: 'Ingest & audit' },
            { id: '2', name: 'IDENTIFY UNCERTAINTY', desc: 'Isolate gaps' },
            { id: '3', name: 'ACT', desc: 'Target highest ROI' },
            { id: '4', name: 'COLLECT EVIDENCE', desc: 'Targeted scenario' },
            { id: '5', name: 'RE-EVALUATE', desc: 'Dynamic Δ calculation' },
            { id: '6', name: 'HUMAN DECIDES', desc: 'Final finality', isFinal: true }
          ].map((node, idx) => (
            <div key={node.id} className={`p-4 rounded-xl border flex items-center justify-between ${
              node.isFinal ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' : 'bg-[#111318] border-[#1E2530] text-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span>{node.name}</span>
              </div>
              <span className="text-[11px] text-slate-500">{node.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5 — THE MOMENT (Centered Dark Card with Animated Score) */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto border-t border-[#1E2530]/60">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Empirical Validation in Action
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            Watch decision readiness change in real-time
          </h2>
        </div>

        <div 
          ref={momentRef}
          className="bg-[#111318] border border-[#1E2530] rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden"
        >
          {/* Radial subtle backdrop */}
          <div className="absolute inset-0 bg-radial from-emerald-500/5 to-transparent pointer-events-none" />

          {/* Large Animated Score Display */}
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              DECISION READINESS GAUGE
            </span>
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl sm:text-7xl font-extrabold font-mono text-white tracking-tighter">
                {momentScore}%
              </div>

              {showDeltaBadge && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-sm font-mono font-bold"
                >
                  +22% DELTA
                </motion.span>
              )}
            </div>

            <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400 pt-1">
              {momentScore >= 80 ? 'READY FOR HUMAN REVIEW' : 'NOT READY'}
            </div>
          </div>

          {/* Sequential 3 Lines */}
          <div className="max-w-md mx-auto space-y-2.5 text-xs font-mono text-left pt-4 border-t border-slate-800">
            {showLine1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-between"
              >
                <span>Critical gap detected:</span>
                <span className="text-rose-400 font-bold">System Design — UNKNOWN</span>
              </motion.div>
            )}

            {showLine2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center justify-between"
              >
                <span>Minimum validation:</span>
                <span className="text-emerald-400 font-bold">5-min scenario · ROI 4.32%/min</span>
              </motion.div>
            )}

            {showLine3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Readiness recalculated:
                </span>
                <span className="text-white">Decision returned to human.</span>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6 — FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto text-center space-y-8 border-t border-[#1E2530]/60">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight max-w-2xl mx-auto">
          The recruiter still decides. HireFlow just makes sure they can.
        </h2>

        <p className="text-sm sm:text-base text-[#94A3B8] font-mono max-w-lg mx-auto">
          Explore the live interactive decision room with pre-calibrated scenario benchmarks.
        </p>

        <div>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2.5 bg-[#10B981] hover:bg-[#059669] text-[#07090C] text-base font-bold px-8 py-4 rounded-xl shadow-2xl shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-1.5 font-mono cursor-pointer"
          >
            <span>Enter HireFlow Decision Room</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1E2530]/40 text-center text-xs font-mono text-slate-500">
        HireFlow — Evidence-First Hiring Decision QA System · Built for Agentic AI 2026
      </footer>
    </div>
  );
};

export default LandingPage;
