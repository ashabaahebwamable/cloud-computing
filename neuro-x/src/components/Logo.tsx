import React from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 'text-lg', lifeline: 'w-8 h-3' },
    md: { text: 'text-2xl', lifeline: 'w-12 h-4' },
    lg: { text: 'text-4xl', lifeline: 'w-20 h-6' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative flex flex-col items-center">
        <h1
          className={`${currentSize.text} font-black tracking-tighter uppercase italic text-white flex items-center gap-1`}
        >
          NEURO
          <span className="text-cyan-400 relative">
            X
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 bg-cyan-400/15 blur-sm rounded-full -z-10"
            />
          </span>
        </h1>

        {/* Animated lifeline */}
        <div className={`relative ${currentSize.lifeline} overflow-hidden pointer-events-none mt-1`}>
          <motion.div
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center"
          >
            <Activity className="w-full h-full text-cyan-400/80" />
            <Activity className="w-full h-full text-cyan-400/80" />
          </motion.div>
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mt-1" />
      </div>
    </div>
  );
}
