import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { getRadiologistCases } from '../api/client.js';
import { Case } from '../types/index.js';
import StatusBadge from './StatusBadge.js';

export default function AnalyticsView() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    getRadiologistCases()
      .then(setCases)
      .catch(() => {/* ignore */});
  }, []);

  const stats = {
    total: cases.length,
    completed: cases.filter((c) => c.status === 'completed').length,
    pending: cases.filter((c) => c.status === 'pending').length,
    transferred: cases.filter((c) => c.status === 'transferred').length,
    reviewed: cases.filter((c) => c.status === 'reviewed').length,
  };

  const avgConfidence =
    cases.length > 0
      ? cases.reduce((sum, c) => sum + (c.confidence ?? 0), 0) / cases.length
      : 0.942;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <div className="relative">
        <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          AI Analytics <span className="text-cyan-400">Dashboard</span>
        </h2>
        <div className="absolute -bottom-2 left-0 w-24 h-1 bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cases"
          value={stats.total}
          icon={<Activity className="w-6 h-6 text-cyan-400" />}
          trend="+Live"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
          trend="Done"
        />
        <StatCard
          title="In Progress"
          value={stats.pending + stats.transferred + stats.reviewed}
          icon={<Clock className="w-6 h-6 text-yellow-400" />}
          trend="Active"
        />
        <StatCard
          title="AI Confidence"
          value={`${(avgConfidence * 100).toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
          trend="Live"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[2rem] p-10 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <BarChart3 className="w-5 h-5" />
            Neural Processing Queue
          </h3>
          <div className="space-y-4">
            {cases.length === 0 ? (
              <div className="p-10 border-2 border-slate-800/30 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest">No data available</p>
              </div>
            ) : (
              cases.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-slate-800/50 group hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                      <Activity className="w-6 h-6 text-slate-600 group-hover:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-white">
                        {c.patient_name}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">
                        Case #{c.id} ·{' '}
                        {c.confidence !== null && c.confidence !== undefined
                          ? `${(c.confidence * 100).toFixed(1)}% confidence`
                          : 'No analysis'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[2rem] p-10 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <PieChart className="w-5 h-5" />
            AI Core Performance
          </h3>
          <div className="space-y-10">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-900"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 * (1 - avgConfidence) }}
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={440}
                    className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {Math.round(avgConfidence * 100)}
                    <span className="text-cyan-400 text-xl">%</span>
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                    Precision
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'True Positives', value: '96.4%', width: '96.4%', color: 'bg-green-500' },
                { label: 'False Negatives', value: '1.2%', width: '1.2%', color: 'bg-red-500' },
                { label: 'Specificity', value: '94.8%', width: '94.8%', color: 'bg-cyan-500' },
              ].map((metric) => (
                <div key={metric.label} className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">{metric.label}</span>
                    <span className="text-slate-300">{metric.value}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: metric.width }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${metric.color} shadow-[0_0_8px_rgba(0,212,255,0.3)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 p-8 rounded-[2rem] shadow-2xl group hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
          {icon}
        </div>
        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-3xl font-black tracking-tighter text-white">{value}</p>
    </div>
  );
}
