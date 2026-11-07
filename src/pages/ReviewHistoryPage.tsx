import React, { useState } from 'react';
import { History, Search, ArrowRight, Trash2, Calendar, FileCode2, ShieldAlert } from 'lucide-react';
import { ReviewResult } from '../types.js';
import { SeverityBadge } from '../components/SeverityBadge.js';
import { deleteReviewHistory } from '../services/api.js';

interface Props {
  reviews: ReviewResult[];
  onSelectReview: (review: ReviewResult) => void;
  onRefreshHistory: () => void;
  onNavigateNewReview: () => void;
}

export const ReviewHistoryPage: React.FC<Props> = ({
  reviews,
  onSelectReview,
  onRefreshHistory,
  onNavigateNewReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this code review from history?')) {
      try {
        await deleteReviewHistory(id);
        onRefreshHistory();
      } catch (err) {
        console.error('Failed to delete review record:', err);
      }
    }
  };

  const filtered = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.projectName.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.language.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Review History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access previous reviews, inspect resolved recommendations, and track quality score evolution.
          </p>
        </div>

        <button
          onClick={onNavigateNewReview}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
        >
          <FileCode2 className="w-4 h-4" />
          <span>New Code Review</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by project name or summary..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Review List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 space-y-3">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No Reviews Recorded
            </h3>
            <p className="text-xs">
              No historical code reviews match your criteria. Start a new code review to generate reports.
            </p>
          </div>
          <button
            onClick={onNavigateNewReview}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Review Code Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => {
            const criticals = rev.issues?.filter((i) => i.severity === 'Critical').length || 0;
            const highs = rev.issues?.filter((i) => i.severity === 'High').length || 0;
            const mediums = rev.issues?.filter((i) => i.severity === 'Medium').length || 0;
            const lows = rev.issues?.filter((i) => i.severity === 'Low').length || 0;

            return (
              <div
                key={rev.id}
                onClick={() => onSelectReview(rev)}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {rev.projectName}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {rev.language}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(rev.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {rev.summary}
                  </p>

                  {/* Severity Summary Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {criticals > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold">
                        {criticals} Critical
                      </span>
                    )}
                    {highs > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                        {highs} High
                      </span>
                    )}
                    {mediums > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {mediums} Medium
                      </span>
                    )}
                    {lows > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
                        {lows} Low
                      </span>
                    )}
                    <span className="text-slate-400">
                      ({rev.issues?.length || 0} total findings)
                    </span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6 shrink-0 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-2xl font-black ${
                        rev.score >= 80
                          ? 'text-emerald-500'
                          : rev.score >= 50
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      {rev.score}/100
                    </span>
                    <span className="block text-[10px] text-slate-400">Quality Score</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, rev.id)}
                      title="Delete review"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
