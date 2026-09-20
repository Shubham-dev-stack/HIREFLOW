import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EvidenceStatus, ProvenanceSource } from '../../types';
import { ProvenanceBadge } from './ProvenanceBadge';

interface StatusBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  provenance?: ProvenanceSource;
  showProvenance?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showTooltip = false,
  provenance,
  showProvenance = false
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getBadgeConfig = () => {
    switch (status) {
      case 'SUPPORTED':
        return {
          label: 'SUPPORTED',
          style: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/60 font-medium',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          tooltip: 'Direct evidence found and verified.',
          shape: (
            // Solid filled circle with checkmark (legible in grayscale)
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="7.5" className="fill-emerald-500 dark:fill-emerald-400" />
              <path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        };
      case 'PARTIAL':
        return {
          label: 'PARTIAL',
          style: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/60 font-medium',
          textColor: 'text-amber-700 dark:text-amber-400',
          tooltip: 'Partial evidence found; specific depth remains unverified.',
          shape: (
            // Half-filled circle (distinct shape)
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500" />
              <path d="M8 1.5 A6.5 6.5 0 0 1 8 14.5 Z" className="fill-amber-500" />
            </svg>
          )
        };
      case 'UNKNOWN':
        return {
          label: 'UNKNOWN',
          // True neutral slate/zinc - STRICTLY ZERO red/rose tint
          style: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-medium',
          textColor: 'text-slate-500 dark:text-slate-400',
          tooltip: 'Insufficient evidence found. Does NOT mean candidate lacks the skill (absence ≠ negative).',
          shape: (
            // Hollow outlined ring with central dot (distinct shape, true neutral grey)
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 dark:text-slate-500" />
              <circle cx="8" cy="8" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
            </svg>
          )
        };
      case 'CONFLICT':
        return {
          label: 'CONFLICT',
          style: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300/90 dark:border-rose-800/80 font-medium',
          textColor: 'text-rose-700 dark:text-rose-400',
          tooltip: 'Contradictory evidence detected across independent documents.',
          shape: (
            // Diagonal split hazard icon (exclusive to genuine conflict)
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16">
              <rect x="2" y="2" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-500" />
              <path d="M4.5 4.5 L11.5 11.5 M11.5 4.5 L4.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-rose-500" />
            </svg>
          )
        };
      case 'HUMAN_REVIEW':
        return {
          label: 'HUMAN REVIEW',
          style: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-medium',
          textColor: 'text-slate-600 dark:text-slate-300',
          tooltip: 'Flagged for human debrief.',
          shape: (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
              <path d="M5 8.5 L7 10.5 L11 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" className="text-slate-500" />
            </svg>
          )
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2'
  }[size];

  return (
    <span className="inline-flex items-center gap-1.5 select-none">
      <motion.span
        key={status}
        initial={prefersReducedMotion ? false : { scale: 0.92, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`inline-flex items-center rounded-md border tracking-wider uppercase font-mono shadow-2xs ${config.style} ${sizeClasses}`}
        title={config.tooltip}
      >
        {config.shape}
        <span>{config.label}</span>
      </motion.span>

      {(showProvenance || provenance) && (
        <ProvenanceBadge source={provenance || 'heuristic'} />
      )}
    </span>
  );
};
