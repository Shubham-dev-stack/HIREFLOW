import React from 'react';
import { Importance } from '../../types';

interface ImportanceBadgeProps {
  importance: Importance;
  size?: 'sm' | 'md';
}

export const ImportanceBadge: React.FC<ImportanceBadgeProps> = ({ 
  importance,
  size = 'md'
}) => {
  const getBadgeStyle = () => {
    switch (importance) {
      case 'Critical':
        return 'text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-800/60 font-semibold';
      case 'High':
        return 'text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/60 font-medium';
      case 'Medium':
        return 'text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium';
      case 'Low':
        return 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-normal';
    }
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center rounded border tracking-wide uppercase font-mono ${sizeClass} ${getBadgeStyle()}`}>
      {importance}
    </span>
  );
};
