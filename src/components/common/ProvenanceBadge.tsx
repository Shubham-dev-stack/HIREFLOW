import React from 'react';
import { ProvenanceSource } from '../../types';

interface ProvenanceBadgeProps {
  source?: ProvenanceSource;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ 
  source = 'heuristic',
  className = '' 
}) => {
  if (source === 'ai') {
    return (
      <span
        title="gemini-3.8-flash"
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 select-none cursor-help ${className}`}
      >
        AI
      </span>
    );
  }

  return (
    <span
      title="deterministic engine"
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200/80 select-none cursor-help ${className}`}
    >
      RULE
    </span>
  );
};
