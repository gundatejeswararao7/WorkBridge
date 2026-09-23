import React from 'react';
import { AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface ReputationBadgeProps {
  delayCount?: number;
  completedJobs?: number;
  status?: 'fresher' | 'reliable' | 'delayed';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  delayCount = 0,
  completedJobs = 0,
  status,
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  // Infer status if not explicitly passed
  const resolvedStatus: 'fresher' | 'reliable' | 'delayed' =
    status ||
    (delayCount > 0
      ? 'delayed'
      : completedJobs > 0
      ? 'reliable'
      : 'fresher');

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (resolvedStatus === 'delayed') {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs select-none ${sizeClasses} ${className}`}
        title={`Overdue History Alert: This worker has ${delayCount} late submission(s) that have not yet been offset by on-time completions.`}
      >
        <AlertTriangle className={`${iconSizes} text-rose-600 shrink-0`} />
        <span>Delay Count: {delayCount}</span>
      </span>
    );
  }

  if (resolvedStatus === 'reliable') {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs select-none ${sizeClasses} ${className}`}
        title={`Verified Reliable: Completed ${completedJobs} project(s) with 0 active delays and a proven record of on-time deliveries.`}
      >
        <ShieldCheck className={`${iconSizes} text-emerald-600 shrink-0`} />
        <span>Good Standing / On-Time Worker</span>
        {showDetails && completedJobs > 0 && (
          <span className="opacity-70 font-semibold">• {completedJobs} done</span>
        )}
      </span>
    );
  }

  // Fresher Status
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs select-none ${sizeClasses} ${className}`}
      title="Fresher: Newly registered member ready to take on their first marketplace project."
    >
      <Sparkles className={`${iconSizes} text-blue-500 shrink-0`} />
      <span>Fresher</span>
    </span>
  );
};
