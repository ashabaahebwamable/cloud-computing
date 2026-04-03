import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, Loader2, RefreshCw, Brain, User } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar.js';
import CaseCard from '../components/CaseCard.js';
import StatusBadge from '../components/StatusBadge.js';
import ConfidenceBar from '../components/ConfidenceBar.js';
import { getSpecialistCases, updateCaseStatus } from '../api/client.js';
import { Case, User as UserType } from '../types/index.js';

interface SpecialistDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function SpecialistDashboard({ user, onLogout }: SpecialistDashboardProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSpecialistCases();
      setCases(data);
    } catch (err) {
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleUpdateStatus = async (status: 'reviewed' | 'completed') => {
    if (!selectedCase) return;
    setUpdating(true);
    try {
      await updateCaseStatus(selectedCase.id, status);
      const updated = { ...selectedCase, status };
      setCases((prev) => prev.map((c) => (c.id === selectedCase.id ? updated : c)));
      setSelectedCase(updated);
      toast.success(`Case marked as ${status}`);
    } catch (err) {
      toast.error((err as Error).message ?? 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const roleColor =
    user.role === 'Doctor'
      ? { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
      : { accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,212,255,0.03),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,rgba(0,212,255,0.015)_1px,_transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navbar user={user} onLogout={onLogout} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
              {user.role} <span className={roleColor.accent}>Terminal</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Transferred Cases · Clinical Review
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${roleColor.bg} ${roleColor.border}`}
            >
              <div className="relative">
                <div className={`w-1.5 h-1.5 rounded-full animate-ping absolute inset-0 ${user.role === 'Doctor' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                <div className={`w-1.5 h-1.5 rounded-full relative z-10 ${user.role === 'Doctor' ? 'bg-purple-400' : 'bg-orange-400'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${roleColor.accent}`}>
                {cases.length} case{cases.length !== 1 ? 's' : ''} assigned
              </span>
            </div>
            <button
              onClick={fetchCases}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case list */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Assigned Queue
            </h3>
            {cases.length === 0 ? (
              <div className="p-10 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-[2rem] flex flex-col items-center justify-center text-slate-700">
                <FileText className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No cases assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((c) => (
                  <CaseCard
                    key={c.id}
                    caseData={c}
                    onClick={() => setSelectedCase(c)}
                    isSelected={selectedCase?.id === c.id}
                    showRadiologist
                  />
                ))}
              </div>
            )}
          </div>

          {/* Case detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedCase ? (
                <motion.div
                  key={selectedCase.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                        {selectedCase.patient_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        {selectedCase.radiologist_name && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-600" />
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                              From: {selectedCase.radiologist_name}
                            </span>
                          </div>
                        )}
                        <span className="text-slate-700">·</span>
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                          Case #{selectedCase.id}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={selectedCase.status} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Image */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Neural Visualization
                      </p>
                      {selectedCase.image_path ? (
                        <div className="relative aspect-video bg-black rounded-2xl border border-slate-800/50 overflow-hidden">
                          <img
                            src={selectedCase.image_path}
                            alt="Ultrasound"
                            className="w-full h-full object-contain opacity-70"
                          />
                          {selectedCase.mask_path && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg
                                className="w-full h-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="xMidYMid meet"
                              >
                                <motion.path
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 0.45 }}
                                  transition={{ duration: 1.2 }}
                                  d={selectedCase.mask_path}
                                  fill="none"
                                  stroke="#00d4ff"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  filter="blur(5px)"
                                />
                                <motion.path
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ duration: 1.2, delay: 0.1 }}
                                  d={selectedCase.mask_path}
                                  fill="none"
                                  stroke="#00d4ff"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  className="drop-shadow-[0_0_6px_rgba(0,212,255,0.9)]"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video bg-slate-900/50 rounded-2xl border border-slate-800/50 flex items-center justify-center text-slate-700">
                          <p className="text-[10px] font-black uppercase tracking-widest">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Info + actions */}
                    <div className="space-y-6">
                      {/* AI findings */}
                      {selectedCase.findings && (
                        <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-4 h-4 text-cyan-400" />
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                              AI Diagnostic Findings
                            </p>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                            "{selectedCase.findings}"
                          </p>
                        </div>
                      )}

                      {/* Transfer notes */}
                      {selectedCase.transfer_notes && (
                        <div className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                            Transfer Notes
                          </p>
                          <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            "{selectedCase.transfer_notes}"
                          </p>
                        </div>
                      )}

                      {selectedCase.confidence !== null &&
                        selectedCase.confidence !== undefined && (
                          <ConfidenceBar confidence={selectedCase.confidence} />
                        )}

                      {/* Action buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleUpdateStatus('reviewed')}
                          disabled={
                            updating ||
                            selectedCase.status === 'reviewed' ||
                            selectedCase.status === 'completed'
                          }
                          className="w-full flex items-center justify-center gap-3 py-4 bg-purple-600/80 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
                        >
                          {updating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Mark as Reviewed
                        </button>

                        <button
                          onClick={() => handleUpdateStatus('completed')}
                          disabled={updating || selectedCase.status === 'completed'}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-green-600/80 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                        >
                          {updating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/10 border-2 border-dashed border-slate-800/30 rounded-[2rem] p-10 flex flex-col items-center justify-center text-slate-700 min-h-[400px]"
                >
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">
                    Select a case to begin review
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
