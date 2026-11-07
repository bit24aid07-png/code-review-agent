import React from 'react';
import { SystemStatus } from '../types.js';
import { X, Server, Database, CheckCircle2, AlertTriangle, ExternalLink, Terminal, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
  onRefresh: () => void;
}

export const HindsightStatusModal: React.FC<Props> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const hindsight = status?.hindsight;
  const isConnected = hindsight?.connected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">Hindsight Memory Engine</h3>
              <p className="text-xs text-slate-400">Long-Term Biomimetic Memory for AI Agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Indicator Banner */}
          <div
            className={`p-4 rounded-lg border flex items-start gap-3.5 ${
              isConnected
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>{isConnected ? 'Hindsight Live Connected' : 'Operating in Standby Mode'}</span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {hindsight?.mode}
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{hindsight?.message}</p>
            </div>
          </div>

          {/* Connection Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Target Endpoint</span>
              <span className="font-mono text-slate-200">{hindsight?.url || 'http://localhost:8888'}</span>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Memory Bank ID</span>
              <span className="font-mono text-slate-200">{hindsight?.bankId || 'codemind-developer'}</span>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Total Memories in Bank</span>
              <span className="font-semibold text-slate-200">{status?.totalMemories ?? 0} retained</span>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Gemini AI Model</span>
              <span className="font-mono text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                gemini-3.8-flash
              </span>
            </div>
          </div>

          {/* How to Connect Real Hindsight */}
          {!isConnected && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Start Local Hindsight Engine (Docker)
              </h4>
              <p className="text-xs text-slate-300">
                To test live multi-strategy vector + graph memory recall, run the official Hindsight container:
              </p>
              <div className="p-3 bg-black/60 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between select-all">
                <code>docker run -p 8888:8888 vectorize/hindsight</code>
              </div>
              <p className="text-[11px] text-slate-500">
                No mock data is claimed: until the container is active, CodeMind uses a local fallback bank while keeping all UI and Gemini reviews fully functional.
              </p>
            </div>
          )}

          {/* Core Concept Summary */}
          <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs space-y-1.5">
            <span className="font-semibold text-indigo-300 block">How Hindsight Powers CodeMind AI:</span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><strong className="text-slate-100">Retain:</strong> Extracts confirmed developer habits, team rules, and architecture choices.</li>
              <li><strong className="text-slate-100">Recall:</strong> Queries memory before each review using hybrid semantic & keyword ranking.</li>
              <li><strong className="text-slate-100">Personalize:</strong> Gemini evaluates code against both global standards and your specific preferences.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onRefresh}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Check Connection Now
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
