import React, { useState } from 'react';
import {
  Settings,
  Server,
  Key,
  Terminal,
  BookOpen,
  Cpu,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { SystemStatus } from '../types.js';

interface Props {
  status: SystemStatus | null;
  onRefreshStatus: () => void;
  onOpenStatusModal: () => void;
}

export const SettingsPage: React.FC<Props> = ({
  status,
  onRefreshStatus,
  onOpenStatusModal,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const isConnected = status?.hindsight?.connected;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>System Diagnostics & Architecture Guide</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete setup instructions, API configurations, and explanation of Hindsight long-term memory.
        </p>
      </div>

      {/* Diagnostics Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gemini Engine */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Google Gemini AI Engine
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Model: gemini-3.8-flash</span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                status?.geminiReady
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
              }`}
            >
              {status?.geminiReady ? 'Ready & Connected' : 'Missing Key'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Calls are securely proxied server-side via the official <code className="font-mono">@google/genai</code> SDK.
            API keys are never exposed to the client bundle.
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            Managed automatically via the AI Studio Secrets panel.
          </div>
        </div>

        {/* Hindsight Memory Engine */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hindsight Long-Term Memory
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {status?.hindsight?.url || 'http://localhost:8888'}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenStatusModal}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              {isConnected ? 'Hindsight Live' : 'Local Standby'}
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {status?.hindsight?.message}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Bank ID: <code className="font-mono text-slate-700 dark:text-slate-300">{status?.hindsight?.bankId}</code>
            </span>
            <button
              onClick={onRefreshStatus}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Re-ping
            </button>
          </div>
        </div>
      </div>

      {/* Student Developer Setup Guide */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Developer Architecture Manual
          </span>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            How to Run CodeMind AI Locally with Python FastAPI & Docker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step-by-step instructions for running the complete ecosystem on your workstation.
          </p>
        </div>

        {/* Step 1: Docker Hindsight */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Launch Official Hindsight Memory Engine via Docker</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Hindsight runs as an isolated microservice on port 8888 providing multi-strategy semantic + keyword memory search:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between select-all">
            <code>docker run -d -p 8888:8888 vectorize/hindsight</code>
            <button
              onClick={() => handleCopy('docker run -d -p 8888:8888 vectorize/hindsight', 'docker')}
              className="text-xs text-slate-400 hover:text-white font-sans"
            >
              {copiedCmd === 'docker' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Step 2: FastAPI */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Run Python FastAPI Backend (Optional Alternative to Integrated Node Server)</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            CodeMind provides a dedicated Python FastAPI backend inside <code className="font-mono">backend/</code>:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 space-y-1">
            <div className="text-slate-400"># Navigate to backend and install requirements:</div>
            <div>cd backend</div>
            <div>python3 -m venv venv &amp;&amp; source venv/bin/activate</div>
            <div>pip install -r requirements.txt</div>
            <div className="text-slate-400 pt-1"># Start FastAPI server on port 8000:</div>
            <div className="text-emerald-400">uvicorn main:app --reload --port 8000</div>
          </div>
        </div>

        {/* Step 3: Dual Backend Philosophy */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <strong className="text-indigo-900 dark:text-indigo-300 block">
            Why Dual Node.js + FastAPI Support?
          </strong>
          <p className="leading-relaxed">
            In AI Studio Cloud Preview, the integrated Node.js/Express server in <code className="font-mono">server.ts</code> runs seamlessly on port 3000 alongside Vite with hot reloading.
            The Python code in <code className="font-mono">backend/</code> provides the authentic, production-grade FastAPI &amp; Pydantic implementation for your local Python toolchain or academic submission!
          </p>
        </div>
      </div>
    </div>
  );
};
