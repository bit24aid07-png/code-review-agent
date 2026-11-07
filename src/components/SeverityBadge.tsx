import React from 'react';
import { IssueSeverity } from '../types.js';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Props {
  severity: IssueSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (severity) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md border ${
            isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-red-500/10 text-red-500 border-red-500/20`}
        >
          <AlertOctagon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Critical
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md border ${
            isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-amber-500/10 text-amber-500 border-amber-500/20`}
        >
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md border ${
            isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-blue-500/10 text-blue-500 border-blue-500/20`}
        >
          <AlertCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md border ${
            isSm ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-slate-500/10 text-slate-400 border-slate-500/20`}
        >
          <Info className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Low
        </span>
      );
  }
};
