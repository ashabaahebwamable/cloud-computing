import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../api/client.js';
import { User } from '../types/index.js';
import Logo from './Logo.js';

interface LoginFormProps {
  onLogin: (user: User, token: string, shiftId: number) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      onLogin(data.user, data.token, data.shiftId);
      toast.success(`Welcome back, ${data.user.name}`);
    } catch (err) {
      toast.error((err as Error).message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1a] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,212,255,0.06),_transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,_transparent_1px),_linear-gradient(90deg,rgba(0,212,255,0.03)_1px,_transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(0,212,255,0.08)',
            '0 0 40px rgba(0,212,255,0.15)',
            '0 0 20px rgba(0,212,255,0.08)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            Clinical AI Terminal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-700 text-white"
                placeholder="radiologist@neurox.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-700 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,212,255,0.2)] hover:shadow-[0_0_40px_rgba(0,212,255,0.35)] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Access Terminal
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-center mb-4">
            Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Radiologist', email: 'radiologist@neurox.com' },
              { label: 'Doctor', email: 'doctor@neurox.com' },
              { label: 'Anesthesiologist', email: 'anesthesiologist@neurox.com' },
            ].map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => fillDemo(d.email)}
                className="px-2 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-700">
            NeuroX v1.0 · ResUNet Architecture
          </span>
        </div>
      </motion.div>
    </div>
  );
}
