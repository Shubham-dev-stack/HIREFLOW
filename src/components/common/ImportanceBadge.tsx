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
        return 'text-rose-700 bg-rose-50/80 border-rose-200/70 font-semibold';
      case 'High':
        return 'text-amber-800 bg-amber-50/80 border-amber-200/70 font-medium';
      case 'Medium':
        return 'text-slate-600 bg-slate-100/70 border-slate-200 font-medium';
      case 'Low':
        return 'text-slate-500 bg-slate-50 border-slate-200 font-normal';
    }
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center rounded border tracking-wide uppercase font-mono ${sizeClass} ${getBadgeStyle()}`}>
      {importance}
    </span>
  );
};
