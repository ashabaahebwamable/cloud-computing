import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ShiftTimerProps {
  loginTime: string | null;
  casesHandled: number;
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

export default function ShiftTimer({ loginTime, casesHandled }: ShiftTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loginTime) return;
    const start = new Date(loginTime).getTime();

    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loginTime]);

  return (
    <div className="flex items-center gap-6 px-6 py-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute inset-0" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full relative z-10" />
        </div>
        <Clock className="w-4 h-4 text-slate-500" />
        <div>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Shift Duration
          </p>
          <p className="text-sm font-black text-cyan-400 font-mono tracking-wider">
            {loginTime ? formatDuration(elapsed) : '--:--:--'}
          </p>
        </div>
      </div>
      <div className="w-px h-8 bg-slate-800" />
      <div>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
          Cases Handled
        </p>
        <p className="text-sm font-black text-white">{casesHandled}</p>
      </div>
    </div>
  );
}
