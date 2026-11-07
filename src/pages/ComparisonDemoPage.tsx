import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  BrainCircuit,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Play,
  Layers,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge.js';
import { SAMPLE_SNIPPETS } from '../data/sampleCode.js';

interface Props {
  onLaunchLiveReview: (code: string, name: string) => void;
}

export const ComparisonDemoPage: React.FC<Props> = ({ onLaunchLiveReview }) => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenarios = [
    {
      title: 'Python Auth Service – Type Hints & Injection Guard',
      codeSnippet: `def get_user_profile(user_id, include_secrets=False):
    query = f"SELECT * FROM users WHERE user_id = '{user_id}'"
    try:
        cursor = db.cursor()
        cursor.execute(query)
        record = cursor.fetchone()
        if not include_secrets:
            del record['password_hash']
        return record
    except:
        return None`,
      genericReview: {
        score: 65,
        summary:
          'Detected SQL injection risk in query f-string and bare except block. Generally functional logic.',
        issues: [
          {
            title: 'SQL Injection Vulnerability',
            severity: 'Critical' as const,
            category: 'Security',
            note: 'Standard vulnerability detection caught this obvious OWASP flaw.',
          },
          {
            title: 'Bare Exception Clause',
            severity: 'Low' as const,
            category: 'Quality',
            note: 'Caught default Python anti-pattern.',
          },
        ],
        missedPoints: [
          'MISSED: Developer insisted on PEP 484 type annotations (user_id: int, -> Optional[User]).',
          'MISSED: Team standard requires domain model serialization instead of dict mutation.',
          'MISSED: Ignored previous review feedback on cursor context manager cleanup.',
        ],
      },
      memoryReview: {
        score: 38,
        summary:
          'Severe security and architectural failure: violates OWASP SQL parameterization rule, breaches developer preference for strict PEP 484 typing, and ignores previous feedback regarding resource cleanup.',
        issues: [
          {
            title: 'SQL Injection Vulnerability via Raw f-string',
            severity: 'Critical' as const,
            category: 'Security',
            note: 'Enforced Team OWASP Parameterization rule.',
          },
          {
            title: 'Missing PEP 484 Type Hints on Arguments and Return',
            severity: 'Medium' as const,
            category: 'Developer Preference',
            note: 'Recalled Hindsight Preference: "Python Type Hints & PEP 484"',
          },
          {
            title: 'Missing Context Manager for DB Cursor',
            severity: 'Medium' as const,
            category: 'Feedback Pattern',
            note: 'Recalled Hindsight Memory: "Context Managers for Resource Cleanup"',
          },
          {
            title: 'Silent Bare Except Clutters Error Auditing',
            severity: 'High' as const,
            category: 'Team Standard',
            note: 'Enforces Team Rule: "Explicit Exception Handling"',
          },
        ],
        gainedValue: [
          'Enforces your team’s custom typing conventions automatically.',
          'Applies lessons from past review mistakes so the same issue is never repeated.',
          'Aligns code style across all microservices without human friction.',
        ],
      },
    },
    {
      title: 'Metrics Data Processor – Loop Complexity & Context Managers',
      codeSnippet: `def process_monthly_metrics(filepath, region_filter):
    f = open(filepath, 'r')
    lines = f.readlines()
    matched = []
    for line in lines:
        parts = line.strip().split(',')
        if len(parts) >= 4:
            for item in parts:
                if item == region_filter:
                    for sub in parts:
                        if sub.startswith("val_"):
                            matched.append(sub)
    f.close()
    return matched`,
      genericReview: {
        score: 78,
        summary: 'Script reads and filters records. No major syntax or runtime crashes.',
        issues: [
          {
            title: 'Unclosed File Risk on Exception',
            severity: 'Medium' as const,
            category: 'Reliability',
            note: 'Generic check noticed f.close() might be skipped if readlines() throws.',
          },
        ],
        missedPoints: [
          'MISSED: Developer strictly forbids nested loops deeper than 2 levels.',
          'MISSED: Team preference for dict/list comprehensions for data transforms.',
          'MISSED: No memory consumption warning on readlines() over large datasets.',
        ],
      },
      memoryReview: {
        score: 48,
        summary:
          'High cognitive complexity and performance penalty: violates remembered preference against nested loops and breaches context manager standard.',
        issues: [
          {
            title: 'Excessive O(N³) Nested Loop Structure',
            severity: 'High' as const,
            category: 'Developer Preference',
            note: 'Recalled Hindsight Preference: "Avoid Nested Loops & Prefer List/Dict Comprehensions"',
          },
          {
            title: 'Missing `with` Statement Context Manager',
            severity: 'Medium' as const,
            category: 'Team Standard',
            note: 'Recalled Hindsight Standard: "Context Managers for Resource Cleanup"',
          },
          {
            title: 'Unbounded Memory Usage via readlines()',
            severity: 'Low' as const,
            category: 'Performance',
            note: 'Suggests generator or line-by-line iteration based on team standards.',
          },
        ],
        gainedValue: [
          'Prevents asymptotic bottlenecks before code merges to production.',
          'Enforces Pythonic idiomatic style customized to your engineering culture.',
        ],
      },
    },
  ];

  const current = scenarios[selectedScenario];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <GitCompare className="w-3.5 h-3.5" />
          Core Differentiator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Before and After Comparison Demo
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          See the tangible contrast between a generic AI reviewer (which has amnesia) and CodeMind AI
          powered by Hindsight Long-Term Memory.
        </p>
      </div>

      {/* Scenario Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {scenarios.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedScenario(idx)}
            className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedScenario === idx
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            Scenario {idx + 1}: {sc.title.split('–')[0]}
          </button>
        ))}
      </div>

      {/* Code Snippet Under Review */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
            {current.title}
          </span>
          <button
            onClick={() => onLaunchLiveReview(current.codeSnippet, current.title)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run This Code in Live Reviewer</span>
          </button>
        </div>
        <div className="p-4 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950 overflow-x-auto leading-relaxed">
          <pre>
            <code>{current.codeSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: WITHOUT HINDSIGHT */}
        <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Without Hindsight
              </span>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                Generic AI Code Review
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {current.genericReview.score}/100
              </span>
              <span className="block text-[10px] text-slate-400">Score</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.genericReview.summary}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Issues Flagged ({current.genericReview.issues.length}):
            </span>
            <div className="space-y-2">
              {current.genericReview.issues.map((iss, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {iss.title}
                    </span>
                    <SeverityBadge severity={iss.severity} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{iss.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What Generic Missed */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              What Standard AI Overlooked (Amnesia):
            </span>
            <ul className="space-y-1 text-[11px]">
              {current.genericReview.missedPoints.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panel 2: WITH HINDSIGHT */}
        <div className="p-6 rounded-2xl border-2 border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-900 space-y-5 shadow-xl shadow-indigo-500/10 relative">
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            Memory Powered
          </div>

          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                With Hindsight Long-Term Memory
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personalized CodeMind Review
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {current.memoryReview.score}/100
              </span>
              <span className="block text-[10px] text-slate-400">Personalized Score</span>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {current.memoryReview.summary}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Issues Flagged ({current.memoryReview.issues.length}):
            </span>
            <div className="space-y-2">
              {current.memoryReview.issues.map((iss, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {iss.title}
                    </span>
                    <SeverityBadge severity={iss.severity} size="sm" />
                  </div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    {iss.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gained Value */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tangible Value of Hindsight:
            </span>
            <ul className="space-y-1 text-[11px]">
              {current.memoryReview.gainedValue.map((v, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
