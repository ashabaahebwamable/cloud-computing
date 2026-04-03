import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { getShiftStats } from '../api/client.js';
import { ShiftStats } from '../types/index.js';

interface ShiftLogProps {
  user: { name: string; email: string; role: string };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

export default function ShiftLog({ user }: ShiftLogProps) {
  const [stats, setStats] = useState<ShiftStats>({ login_time: null, cases_handled: 0 });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    getShiftStats()
      .then(setStats)
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    if (!stats.login_time) return;
    const start = new Date(stats.login_time).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stats.login_time]);

  return (
    <div className="space-y-10 max-w-2xl mx-auto pb-20">
      <div className="relative">
        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          Shift <span className="text-cyan-400">Log</span>
        </h2>
        <div className="absolute -bottom-2 left-0 w-24 h-1 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
              Clinician Identity
            </label>
            <div className="px-5 py-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl">
              <p className="text-white font-black">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">
                {user.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
                Shift Start
              </label>
              <div className="relative px-5 py-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <p className="text-white font-black font-mono">
                  {stats.login_time
                    ? new Date(stats.login_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
                Elapsed Time
              </label>
              <div className="relative px-5 py-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-500" />
                <p className="text-cyan-400 font-black font-mono tracking-wider">
                  {stats.login_time ? formatDuration(elapsed) : '--:--:--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-start gap-4"
        >
          <AlertCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-cyan-400/80 leading-relaxed font-black uppercase tracking-widest">
            Shift parameters synchronized with central neural core. HIPAA-compliant auditing active.
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">
            Current Date
          </p>
          <p className="text-sm font-black text-white tracking-tight">
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="p-6 bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">
            Cases Handled
          </p>
          <p className="text-sm font-black text-cyan-400 tracking-tight">
            {stats.cases_handled}
          </p>
        </div>
        <div className="p-6 bg-slate-900/20 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">
            Status
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-sm font-black text-green-500 tracking-tight uppercase">
              Active Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
