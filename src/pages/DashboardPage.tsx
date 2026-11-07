import React from 'react';
import {
  FileCode2,
  AlertOctagon,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Server,
  Zap,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { ReviewResult, MemoryItem, SystemStatus } from '../types.js';
import { SeverityBadge } from '../components/SeverityBadge.js';
import { SAMPLE_SNIPPETS } from '../data/sampleCode.js';

interface Props {
  reviews: ReviewResult[];
  memories: MemoryItem[];
  status: SystemStatus | null;
  onNavigateNewReview: (prefillCode?: string, prefillName?: string) => void;
  onSelectReview: (review: ReviewResult) => void;
  onNavigateTab: (tab: any) => void;
  onOpenStatusModal: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  reviews,
  memories,
  status,
  onNavigateNewReview,
  onSelectReview,
  onNavigateTab,
  onOpenStatusModal,
}) => {
  // Compute metrics
  const totalReviews = reviews.length;
  const totalIssues = reviews.reduce((acc, r) => acc + (r.issues?.length || 0), 0);
  const criticalIssues = reviews.reduce(
    (acc, r) => acc + (r.issues?.filter((i) => i.severity === 'Critical').length || 0),
    0
  );
  const rememberedPreferences = memories.length;

  const isHindsightConnected = status?.hindsight?.connected;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Biomimetic Memory Agent Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Code Reviews That <span className="text-indigo-400">Remember Your Standards</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Unlike standard AI reviewers with amnesia, CodeMind AI uses{' '}
            <strong className="text-white">Hindsight Long-Term Memory</strong> to recall your team&apos;s
            coding preferences, architectural rules, and previous review lessons on every submission.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateNewReview()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Start New Code Review</span>
            </button>
            <button
              onClick={() => onNavigateTab('comparison')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <GitCompare className="w-4 h-4 text-indigo-400" />
              <span>See Before & After Comparison</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Reviews
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalReviews}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Codebases analyzed</p>
        </div>

        {/* Issues Detected */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Issues Detected
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalIssues}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Across all categories</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Security, syntax, standards</p>
        </div>

        {/* Critical Issues */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Critical Bugs
            </span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
              {criticalIssues}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Action required</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Exploits & fatal logic errors</p>
        </div>

        {/* Remembered Preferences */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Memories Retained
            </span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {rememberedPreferences}
            </span>
            <button
              onClick={onOpenStatusModal}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer ${
                isHindsightConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isHindsightConnected ? 'Hindsight Live' : 'Standby'}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Persistent preferences & standards
          </p>
        </div>
      </div>

      {/* Quick Launch Pre-loaded Code Snippets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Try Interactive Test Scenarios</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any scenario to instantly launch a review and watch Hindsight recall memories in action.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SNIPPETS.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => onNavigateNewReview(snippet.code, snippet.name)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {snippet.language}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {snippet.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {snippet.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{snippet.expectedMemoryTrigger}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Reviews & Active Memory Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Code Reviews
            </h2>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all history ({reviews.length})
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                No code reviews yet. Submit your first Python code for review above!
              </div>
            ) : (
              reviews.slice(0, 5).map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => onSelectReview(rev)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {rev.projectName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {rev.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg">
                      {rev.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold ${
                          rev.score >= 80
                            ? 'text-emerald-500'
                            : rev.score >= 50
                            ? 'text-amber-500'
                            : 'text-red-500'
                        }`}
                      >
                        {rev.score}/100
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {rev.issues?.length || 0} issues
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Memories in Memory Bank (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-violet-500" />
              <span>Remembered Preferences</span>
            </h2>
            <button
              onClick={() => onNavigateTab('memory')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage ({memories.length})
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-xs">
            <div className="space-y-2">
              {memories.slice(0, 4).map((mem) => (
                <div
                  key={mem.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {mem.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {mem.content}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('memory')}
              className="w-full py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
            >
              + Add Developer Preference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
