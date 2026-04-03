import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, FileText, Microscope } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar.js';
import ShiftTimer from '../components/ShiftTimer.js';
import UploadCaseForm from '../components/UploadCaseForm.js';
import CaseCard from '../components/CaseCard.js';
import TransferCaseModal from '../components/TransferCaseModal.js';
import StatusBadge from '../components/StatusBadge.js';
import ConfidenceBar from '../components/ConfidenceBar.js';
import {
  getRadiologistCases,
  getShiftStats,
  getUsers,
  transferCase,
} from '../api/client.js';
import { Case, ShiftStats, TransferUser, UploadCaseResult, User } from '../types/index.js';

interface RadiologistDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function RadiologistDashboard({ user, onLogout }: RadiologistDashboardProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({ login_time: null, cases_handled: 0 });
  const [users, setUsers] = useState<TransferUser[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'cases'>('upload');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesData, statsData, usersData] = await Promise.all([
        getRadiologistCases(),
        getShiftStats(),
        getUsers(),
      ]);
      setCases(casesData);
      setShiftStats(statsData);
      setUsers(usersData);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCaseUploaded = (result: UploadCaseResult & { patientName: string }) => {
    // Optimistically add the new case to the list
    const newCase: Case = {
      id: result.id,
      uploaded_by: user.id,
      patient_name: result.patientName,
      image_path: result.imagePath,
      mask_path: result.maskPath,
      findings: result.findings,
      confidence: result.confidence,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setCases((prev) => [newCase, ...prev]);
    setShiftStats((prev) => ({ ...prev, cases_handled: prev.cases_handled + 1 }));
    setActiveTab('cases');
    setSelectedCase(newCase);
  };

  const handleTransfer = async (userId: number, notes: string) => {
    if (!selectedCase) return;
    try {
      await transferCase(selectedCase.id, userId, notes);
      const recipient = users.find((u) => u.id === userId);
      toast.success(`Case transferred to ${recipient?.name ?? 'specialist'}`);
      // Update local state
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id
            ? { ...c, status: 'transferred', sent_to_name: recipient?.name }
            : c
        )
      );
      setSelectedCase((prev) =>
        prev ? { ...prev, status: 'transferred', sent_to_name: recipient?.name } : null
      );
    } catch (err) {
      toast.error((err as Error).message ?? 'Transfer failed');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,212,255,0.04),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,rgba(0,212,255,0.02)_1px,_transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navbar user={user} onLogout={onLogout} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
              Radiology <span className="text-cyan-400">Terminal</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Peripheral Nerve Segmentation · ResUNet Architecture
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ShiftTimer
              loginTime={shiftStats.login_time ?? user.loginTime ?? null}
              casesHandled={shiftStats.cases_handled}
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 p-1.5 bg-slate-900/40 border border-slate-800 rounded-2xl w-fit">
          {[
            { id: 'upload', label: 'Upload Case', icon: <Microscope className="w-4 h-4" /> },
            { id: 'cases', label: `My Cases (${cases.length})`, icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'upload' | 'cases')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              <UploadCaseForm onCaseUploaded={handleCaseUploaded} />
            </motion.div>
          ) : (
            <motion.div
              key="cases"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Case list */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  Case Queue ({cases.length})
                </h3>
                {cases.length === 0 ? (
                  <div className="p-10 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-[2rem] flex flex-col items-center justify-center text-slate-700">
                    <FileText className="w-10 h-10 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No cases yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cases.map((c) => (
                      <CaseCard
                        key={c.id}
                        caseData={c}
                        onClick={() => setSelectedCase(c)}
                        isSelected={selectedCase?.id === c.id}
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
                      {/* Case header */}
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                            {selectedCase.patient_name}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                            Case #{selectedCase.id} ·{' '}
                            {new Date(selectedCase.created_at).toLocaleString()}
                          </p>
                        </div>
                        <StatusBadge status={selectedCase.status} />
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Image + overlay */}
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
                              <p className="text-[10px] font-black uppercase tracking-widest">
                                No image
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Findings + actions */}
                        <div className="space-y-6">
                          {selectedCase.findings && (
                            <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-3">
                                AI Diagnostic Findings
                              </p>
                              <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                                "{selectedCase.findings}"
                              </p>
                            </div>
                          )}

                          {selectedCase.confidence !== null &&
                            selectedCase.confidence !== undefined && (
                              <ConfidenceBar confidence={selectedCase.confidence} />
                            )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
                                Status
                              </p>
                              <StatusBadge status={selectedCase.status} />
                            </div>
                            {selectedCase.sent_to_name && (
                              <div className="p-4 bg-black/40 rounded-2xl border border-slate-800/50">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
                                  Transferred To
                                </p>
                                <p className="text-xs font-black text-white">
                                  {selectedCase.sent_to_name}
                                </p>
                              </div>
                            )}
                          </div>

                          {selectedCase.status === 'pending' && (
                            <button
                              onClick={() => setTransferModalOpen(true)}
                              className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                            >
                              <Send className="w-4 h-4" />
                              Transfer to Specialist
                            </button>
                          )}
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
                        Select a case to view details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transfer modal */}
      <TransferCaseModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransfer}
        users={users}
        patientName={selectedCase?.patient_name ?? ''}
      />
    </div>
  );
}
