import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Clock, User } from 'lucide-react';
import { Case } from '../types/index.js';
import StatusBadge from './StatusBadge.js';
import ConfidenceBar from './ConfidenceBar.js';

interface CaseCardProps {
  caseData: Case;
  onClick?: () => void;
  isSelected?: boolean;
  showRadiologist?: boolean;
}

export default function CaseCard({
  caseData,
  onClick,
  isSelected,
  showRadiologist,
}: CaseCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, x: 3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
        isSelected
          ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(0,212,255,0.08)]'
          : 'bg-slate-900/20 border-slate-800/50 hover:border-slate-700'
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 w-0.5 h-full bg-cyan-400" />
      )}

      <div className="flex items-start gap-4">
        {/* Image thumbnail or placeholder */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? 'bg-cyan-500/20'
              : 'bg-slate-900/50 border border-slate-800 group-hover:bg-cyan-500/10'
          }`}
        >
          {caseData.image_path ? (
            <img
              src={caseData.image_path}
              alt="Ultrasound thumbnail"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <ImageIcon
              className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-500'}`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p
              className={`text-sm font-black uppercase tracking-tight truncate ${
                isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
              }`}
            >
              {caseData.patient_name}
            </p>
            <StatusBadge status={caseData.status} />
          </div>

          {showRadiologist && caseData.radiologist_name && (
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-3 h-3 text-slate-600" />
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                {caseData.radiologist_name}
              </span>
            </div>
          )}

          {caseData.confidence !== null && caseData.confidence !== undefined && (
            <ConfidenceBar confidence={caseData.confidence} showLabel={false} className="mt-2" />
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-slate-700" />
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
              {new Date(caseData.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
