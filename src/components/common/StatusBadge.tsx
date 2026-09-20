import React from 'react';
import { EvidenceStatus, ProvenanceSource } from '../../types';
import { Check, AlertCircle, HelpCircle, AlertTriangle, UserCheck } from 'lucide-react';
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
  const getBadgeConfig = () => {
    switch (status) {
      case 'SUPPORTED':
        return {
          label: 'SUPPORTED',
          icon: Check,
          style: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/60 font-medium',
          dot: 'bg-emerald-500',
          tooltip: 'Direct evidence found and verified.'
        };
      case 'PARTIAL':
        return {
          label: 'PARTIAL',
          icon: AlertCircle,
          style: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/60 font-medium',
          dot: 'bg-amber-500',
          tooltip: 'Partial evidence found; specific depth remains unverified.'
        };
      case 'UNKNOWN':
        return {
          label: 'UNKNOWN',
          icon: HelpCircle,
          style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium',
          dot: 'bg-slate-400',
          tooltip: 'Insufficient evidence found. Does NOT mean candidate lacks the skill.'
        };
      case 'CONFLICT':
        return {
          label: 'CONFLICT',
          icon: AlertTriangle,
          style: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/60 font-medium',
          dot: 'bg-rose-500',
          tooltip: 'Contradictory evidence detected.'
        };
      case 'HUMAN_REVIEW':
        return {
          label: 'HUMAN REVIEW',
          icon: UserCheck,
          style: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-medium',
          dot: 'bg-slate-500',
          tooltip: 'Flagged for human debrief.'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2'
  }[size];

  return (
    <span className="inline-flex items-center gap-1.5 select-none">
      <span
        className={`inline-flex items-center rounded-md border tracking-wider uppercase font-mono ${config.style} ${sizeClasses}`}
        title={config.tooltip}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{config.label}</span>
      </span>

      {(showProvenance || provenance) && (
        <ProvenanceBadge source={provenance || 'heuristic'} />
      )}
    </span>
  );
};
