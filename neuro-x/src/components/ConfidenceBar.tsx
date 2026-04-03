import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ConfidenceBarProps {
  confidence: number; // 0–1
  showLabel?: boolean;
  className?: string;
}

function getColor(confidence: number): string {
  if (confidence >= 0.9) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
  if (confidence >= 0.75) return 'bg-cyan-500 shadow-[0_0_8px_rgba(0,212,255,0.4)]';
  if (confidence >= 0.6) return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]';
  return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
}

function getTextColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-400';
  if (confidence >= 0.75) return 'text-cyan-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-red-400';
}

export default function ConfidenceBar({
  confidence,
  showLabel = true,
  className,
}: ConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const barColor = getColor(confidence);
  const textColor = getTextColor(confidence);

  return (
    <div className={clsx('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
            AI Confidence
          </span>
          <span className={clsx('text-[10px] font-black', textColor)}>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', barColor)}
        />
      </div>
    </div>
  );
}
