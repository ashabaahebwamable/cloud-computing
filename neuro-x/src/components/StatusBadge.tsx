import React from 'react';
import { clsx } from 'clsx';

type Status = 'pending' | 'transferred' | 'reviewed' | 'completed';

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  transferred: {
    label: 'Transferred',
    classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  reviewed: {
    label: 'Reviewed',
    classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status] ?? {
    label: status,
    classes: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
