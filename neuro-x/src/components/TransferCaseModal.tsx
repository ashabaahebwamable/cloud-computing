import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, User } from 'lucide-react';
import { TransferUser } from '../types/index.js';

interface TransferCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (userId: number, notes: string) => Promise<void>;
  users: TransferUser[];
  patientName: string;
}

export default function TransferCaseModal({
  isOpen,
  onClose,
  onTransfer,
  users,
  patientName,
}: TransferCaseModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onTransfer(selectedUserId, notes);
      setNotes('');
      setSelectedUserId(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-[#0a0f1a] border border-slate-800 rounded-[2rem] p-8 shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                    Transfer Case
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                    {patientName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Select Recipient
                  </label>
                  <div className="space-y-2">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          selectedUserId === u.id
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                            : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            selectedUserId === u.id
                              ? 'bg-cyan-500/20'
                              : 'bg-slate-900/50 border border-slate-800'
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-black">{u.name}</p>
                          <p className="text-[9px] uppercase tracking-widest font-black opacity-60">
                            {u.role}
                          </p>
                        </div>
                        {selectedUserId === u.id && (
                          <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Transfer Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add clinical notes for the recipient..."
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none transition-all placeholder:text-slate-700 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedUserId || loading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Transfer Case
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
