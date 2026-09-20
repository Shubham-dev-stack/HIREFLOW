import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface ReadinessGaugeProps {
  score: number;
  status: 'NOT READY' | 'READY FOR HUMAN REVIEW' | 'FULLY VALIDATED';
  showDelta?: boolean;
  delta?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score,
  status,
  showDelta = false,
  delta = 22,
  size = 'lg'
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 800; // 800ms smooth ease transition
    const startScore = displayScore;
    const targetScore = score;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startScore + (targetScore - startScore) * ease);
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const isReady = status === 'READY FOR HUMAN REVIEW' || status === 'FULLY VALIDATED';

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-between">
      {/* Circular Animated SVG Gauge */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-slate-100 dark:text-slate-800"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`transition-all duration-700 ease-out ${
              isReady ? 'text-emerald-500' : 'text-slate-900 dark:text-emerald-400'
            }`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Text inside circular gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {displayScore}%
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
            Readiness
          </span>
        </div>
      </div>

      {/* Label and Rationale Details */}
      <div className="space-y-3 text-center sm:text-left flex-1">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${
              isReady
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-900 dark:bg-slate-800 text-white'
            }`}
          >
            {isReady ? (
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert size={14} className="text-amber-400" />
            )}
            <span>{status}</span>
          </span>

          {showDelta && score >= 80 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 animate-bounce">
              <ArrowUpRight size={13} />
              <span>+{delta}% DELTA</span>
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {isReady
            ? 'Evidence Threshold Achieved (≥80%)'
            : 'Evidence Gaps Prevent Confident Decision'}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          {isReady
            ? 'Critical uncertainties resolved through targeted validation. Ready for final human review.'
            : 'Decision Readiness checks whether there is sufficient verified proof to make a hiring decision, not candidate capability.'}
        </p>

        {/* Progress Bar & Threshold Marker */}
        <div className="pt-2 space-y-1">
          <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isReady ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-emerald-500'
              }`}
              style={{ width: `${displayScore}%` }}
            />
            {/* 80% Threshold line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
              style={{ left: '80%' }}
              title="80% Review Threshold"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span>0% Unverified</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">80% Target</span>
            <span>100% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};
