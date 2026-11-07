import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  GitCompare,
  ArrowLeft,
  FileCode2,
  ShieldCheck,
  Layers,
  Flame,
  Plus,
} from 'lucide-react';
import { ReviewResult, ReviewIssue, IssueSeverity } from '../types.js';
import { SeverityBadge } from '../components/SeverityBadge.js';
import { retainMemory } from '../services/api.js';

interface Props {
  result: ReviewResult;
  onBackToNewReview: () => void;
  onMemoryRetained: () => void;
}

export const ReviewResultPage: React.FC<Props> = ({
  result,
  onBackToNewReview,
  onMemoryRetained,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [retainedIndexMap, setRetainedIndexMap] = useState<Record<number, boolean>>({});
  const [showComparisonTab, setShowComparisonTab] = useState<boolean>(false);
  const [retainingIndex, setRetainingIndex] = useState<number | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetainSuggestion = async (suggestion: string, index: number) => {
    setRetainingIndex(index);
    try {
      await retainMemory({
        title: suggestion.slice(0, 50),
        content: suggestion,
        category: 'feedback',
        tags: ['review-feedback', result.language.toLowerCase()],
        source: 'extracted_from_review',
      });
      setRetainedIndexMap((prev) => ({ ...prev, [index]: true }));
      onMemoryRetained();
    } catch (err) {
      console.error('Failed to retain suggested memory:', err);
    } finally {
      setRetainingIndex(null);
    }
  };

  const issues = result.issues || [];
  const filteredIssues = issues.filter((iss) => {
    if (selectedSeverity === 'all') return true;
    if (selectedSeverity === 'memory-driven') return iss.isMemoryDriven;
    return iss.severity.toLowerCase() === selectedSeverity.toLowerCase();
  });

  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const memoryDrivenCount = issues.filter((i) => i.isMemoryDriven).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToNewReview}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Code Editor</span>
        </button>

        <div className="flex items-center gap-2">
          {result.baselineComparison && (
            <button
              onClick={() => setShowComparisonTab(!showComparisonTab)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                showComparisonTab
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{showComparisonTab ? 'View Full Report' : 'Compare: With vs Without Memory'}</span>
            </button>
          )}

          <button
            onClick={onBackToNewReview}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* BEFORE & AFTER COMPARISON VIEW (If requested) */}
      {showComparisonTab && result.baselineComparison && (
        <div className="p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-slate-900/80 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4" />
              Side-by-Side Comparison
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              The Value of Hindsight Memory in Code Review
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {result.baselineComparison.differencesExplanation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Memory (Generic AI) */}
            <div className="p-5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Without Hindsight (Generic AI)
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Amnesic Linter Review
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
                    {result.baselineComparison.score}/100
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {result.baselineComparison.issuesCount} issues found
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.baselineComparison.summary}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Detected Generic Observations:
                </span>
                <div className="space-y-1.5">
                  {result.baselineComparison.issues.slice(0, 3).map((iss, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{iss.title}</span>
                        <SeverityBadge severity={iss.severity} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {iss.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <strong>Limitation:</strong> Does not enforce your team&apos;s typing rules, doesn&apos;t know
                your preferred comprehensions, and ignores previous review architecture decisions.
              </div>
            </div>

            {/* With Hindsight Memory (Personalized AI) */}
            <div className="p-5 rounded-xl border-2 border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    With Hindsight Long-Term Memory
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Personalized Code Review
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {result.score}/100
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {result.issues.length} issues ({memoryDrivenCount} memory-driven)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {result.summary}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Tailored Memory Violations Detected:
                </span>
                <div className="space-y-1.5">
                  {result.issues
                    .filter((i) => i.isMemoryDriven)
                    .slice(0, 3)
                    .map((iss, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{iss.title}</span>
                          <SeverityBadge severity={iss.severity} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {iss.explanation}
                        </p>
                        {iss.relatedMemoryTitle && (
                          <span className="mt-1 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            Enforces rule: &quot;{iss.relatedMemoryTitle}&quot;
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <strong>Advantage:</strong> Your team achieves consistent standards over time without
                repeating the same review comments on every pull request.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Review Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {result.projectName}
              </h1>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {result.language}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reviewed on {new Date(result.timestamp).toLocaleDateString()} at{' '}
              {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>

          {/* Health Score Gauge */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-semibold uppercase text-slate-400 block">
                Code Health Score
              </span>
              <span
                className={`text-3xl sm:text-4xl font-extrabold ${
                  result.score >= 80
                    ? 'text-emerald-500'
                    : result.score >= 50
                    ? 'text-amber-500'
                    : 'text-red-500'
                }`}
              >
                {result.score}
                <span className="text-base text-slate-400">/100</span>
              </span>
            </div>

            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                result.score >= 80
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : result.score >= 50
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {result.score >= 80 ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <AlertOctagon className="w-8 h-8" />
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Executive Summary
          </h2>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {result.summary}
          </p>
        </div>

        {/* Strengths & Key Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Observed Strengths
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {result.strengths.length === 0 ? (
                <li className="text-slate-400">Standard implementation style.</li>
              ) : (
                result.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Key Improvements */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Top Recommendations
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {result.keyImprovements.length === 0 ? (
                <li className="text-slate-400">No major systemic improvements suggested.</li>
              ) : (
                result.keyImprovements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Recalled Memory Impact Banner */}
        {result.recalledMemories && result.recalledMemories.length > 0 && (
          <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-500" />
                Hindsight Memory Context Applied ({result.recalledMemories.length} rules recalled)
              </span>
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-mono">
                {memoryDrivenCount} issues customized by memory
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.recalledMemories.map((mem) => (
                <span
                  key={mem.id}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-violet-200 dark:border-violet-900/60 shadow-2xs"
                >
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
                    [{mem.category}]
                  </span>
                  <span>{mem.title}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested New Memories to Retain */}
      {result.suggestedMemoriesToRetain && result.suggestedMemoriesToRetain.length > 0 && (
        <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-linear-to-r from-indigo-50/60 to-purple-50/60 dark:from-slate-900 dark:to-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Extract & Retain Useful Preferences
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Gemini detected these recurring patterns. Store them in Hindsight so the agent remembers
                for all your future reviews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {result.suggestedMemoriesToRetain.map((suggestion, idx) => {
              const isRetained = retainedIndexMap[idx];
              const isProcessing = retainingIndex === idx;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-start justify-between gap-3 text-xs"
                >
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    &quot;{suggestion}&quot;
                  </p>
                  <button
                    onClick={() => handleRetainSuggestion(suggestion, idx)}
                    disabled={isRetained || isProcessing}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      isRetained
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    {isRetained ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Retained in Hindsight</span>
                      </>
                    ) : isProcessing ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Retain</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues Section with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Detailed Code Findings</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {issues.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each issue includes technical reasoning and copyable corrected code examples.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${issues.length})` },
              { id: 'Critical', label: `Critical (${criticalCount})` },
              { id: 'High', label: `High (${highCount})` },
              { id: 'memory-driven', label: `Memory Driven (${memoryDrivenCount})` },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedSeverity(chip.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSeverity === chip.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Cards */}
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No Issues Found in this Category
            </h3>
            <p className="text-xs">
              The code conforms to all evaluated rules for this severity level.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 p-5"
              >
                {/* Issue Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {issue.category}
                      </span>
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                        {issue.location}
                      </span>
                      {issue.isMemoryDriven && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          <BrainCircuit className="w-3 h-3" />
                          Memory Driven
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {issue.title}
                    </h3>

                    {issue.relatedMemoryTitle && (
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                        Informed by remembered standard: &quot;{issue.relatedMemoryTitle}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Technical Explanation */}
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                  <p>{issue.explanation}</p>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
                      Why it is a problem:
                    </strong>
                    <span className="text-slate-600 dark:text-slate-400">{issue.whyItIsAProblem}</span>
                  </div>
                </div>

                {/* Suggested Solution */}
                <div className="space-y-1 text-xs">
                  <strong className="text-slate-900 dark:text-slate-100 block">
                    Suggested Solution:
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {issue.suggestedSolution}
                  </p>
                </div>

                {/* Corrected Code Block */}
                {issue.correctedCode && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>Corrected Implementation Example</span>
                      <button
                        onClick={() => handleCopyCode(issue.id, issue.correctedCode!)}
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {copiedId === issue.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                      <pre>
                        <code>{issue.correctedCode}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
