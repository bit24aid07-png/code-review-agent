import React from 'react';
import { SystemStatus } from '../types.js';
import {
  Brain,
  Server,
  Sparkles,
  Sun,
  Moon,
  PlusCircle,
  Activity,
  Layers,
} from 'lucide-react';

interface Props {
  status: SystemStatus | null;
  onOpenStatusModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateNewReview: () => void;
}

export const Navbar: React.FC<Props> = ({
  status,
  onOpenStatusModal,
  isDark,
  onToggleTheme,
  onNavigateNewReview,
}) => {
  const hindsightConnected = status?.hindsight?.connected;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              CodeMind <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-2.5 h-2.5" />
              Memory-Powered
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right Status Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hindsight Status Pill */}
        <button
          onClick={onOpenStatusModal}
          title="Click for Hindsight Memory diagnostics and connection details"
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
            hindsightConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hindsightConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                hindsightConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-medium hidden md:inline">
            {hindsightConnected ? 'Hindsight Live' : 'Hindsight Offline (Local Standby)'}
          </span>
          <span className="font-medium md:hidden">
            {hindsightConnected ? 'Hindsight' : 'Standby'}
          </span>
          <Server className="w-3 h-3 opacity-70" />
        </button>

        {/* Gemini Engine Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
          <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
          <span className="text-[11px] font-mono">Gemini 3.8 Flash</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick New Review Action */}
        <button
          onClick={onNavigateNewReview}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs hover:shadow transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Review</span>
        </button>
      </div>
    </header>
  );
};
