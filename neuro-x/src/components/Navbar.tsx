import React from 'react';
import { LogOut, User, Cpu } from 'lucide-react';
import { User as UserType } from '../types/index.js';
import Logo from './Logo.js';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-800/50 bg-[#0a0f1a]/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
      <Logo size="sm" />

      <div className="flex items-center gap-4">
        {/* Session indicator */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
          <div className="relative">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute inset-0" />
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full relative z-10" />
          </div>
          <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">
            Session Active
          </span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">
          <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-white leading-none">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Cpu className="w-2.5 h-2.5 text-cyan-500" />
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
