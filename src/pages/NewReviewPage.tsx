import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode2,
  Upload,
  Sparkles,
  Play,
  BrainCircuit,
  GitCompare,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { ReviewResult, MemoryItem } from '../types.js';
import { submitCodeReview } from '../services/api.js';
import { SAMPLE_SNIPPETS } from '../data/sampleCode.js';

interface Props {
  initialCode?: string;
  initialProjectName?: string;
  isDark: boolean;
  memories: MemoryItem[];
  onReviewCompleted: (result: ReviewResult) => void;
  onOpenStatusModal: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python (.py)', monacoLang: 'python' },
  { id: 'typescript', name: 'TypeScript (.ts)', monacoLang: 'typescript' },
  { id: 'javascript', name: 'JavaScript (.js)', monacoLang: 'javascript' },
  { id: 'go', name: 'Go (.go)', monacoLang: 'go' },
  { id: 'rust', name: 'Rust (.rs)', monacoLang: 'rust' },
];

export const NewReviewPage: React.FC<Props> = ({
  initialCode,
  initialProjectName,
  isDark,
  memories,
  onReviewCompleted,
  onOpenStatusModal,
}) => {
  const [projectName, setProjectName] = useState(
    initialProjectName || 'FastAPI User Service'
  );
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(
    initialCode || SAMPLE_SNIPPETS[0].code
  );
  const [instructions, setInstructions] = useState('');
  const [useMemory, setUseMemory] = useState(true);
  const [generateComparison, setGenerateComparison] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
    if (initialProjectName) setProjectName(initialProjectName);
  }, [initialCode, initialProjectName]);

  const pipelineSteps = [
    'Connecting to Hindsight Long-Term Memory Bank...',
    'Recalling active developer preferences & team standards...',
    'Sending AST & memory context to Gemini 3.8 Flash...',
    'Evaluating code against recalled preferences and OWASP rules...',
    'Synthesizing personalized review & extracting new insights...',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024) {
      setErrorMessage('File size exceeds the 80KB limit. Please upload a smaller code file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      setProjectName(file.name.replace(/\.[^/.]+$/, ''));

      // Auto detect language
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'py') setLanguage('python');
      else if (ext === 'ts' || ext === 'tsx') setLanguage('typescript');
      else if (ext === 'js' || ext === 'jsx') setLanguage('javascript');
      else if (ext === 'go') setLanguage('go');
      else if (ext === 'rs') setLanguage('rust');
    };
    reader.readAsText(file);
  };

  const handleSubmitReview = async () => {
    if (!code.trim()) {
      setErrorMessage('Please provide code to review.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep(0);

    // Progress animation loop
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < pipelineSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const result = await submitCodeReview({
        projectName,
        language: SUPPORTED_LANGUAGES.find((l) => l.id === language)?.name.split(' ')[0] || 'Python',
        code,
        instructions,
        useMemory,
        generateComparison,
      });

      clearInterval(interval);
      setIsLoading(false);
      onReviewCompleted(result);
    } catch (err: any) {
      clearInterval(interval);
      setIsLoading(false);
      setErrorMessage(
        err.message ||
          'Failed to complete code review. Please ensure GEMINI_API_KEY is configured in AI Studio Secrets.'
      );
    }
  };

  const selectedMonacoLang =
    SUPPORTED_LANGUAGES.find((l) => l.id === language)?.monacoLang || 'python';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCode2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>New Code Review</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit Python code to receive an intelligent, memory-personalized code quality analysis.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Load Template:
          </span>
          <select
            aria-label="Load code template"
            onChange={(e) => {
              const selected = SAMPLE_SNIPPETS.find((s) => s.id === e.target.value);
              if (selected) {
                setCode(selected.code);
                setProjectName(selected.name);
                setLanguage('python');
              }
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select sample code...
            </option>
            {SAMPLE_SNIPPETS.map((snippet) => (
              <option key={snippet.id} value={snippet.id}>
                {snippet.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Review Error</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Configuration Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Payments Service API"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Programming Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload File button */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upload Source File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".py,.js,.jsx,.ts,.tsx,.go,.rs,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-xs px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Choose File (.py, .ts, etc.)</span>
            </button>
          </div>
        </div>

        {/* Optional Review Instructions */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Special Review Instructions (Optional)</span>
            <span className="text-[11px] font-normal text-slate-400">
              e.g., &quot;Strict security audit for payments&quot; or &quot;Optimize CPU utilization&quot;
            </span>
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Add specific instructions or questions for the AI reviewer..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Memory & Comparison Toggles */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Toggle 1: Use Hindsight */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useMemory}
                onChange={(e) => setUseMemory(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                  Apply Hindsight Memory
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Recall {memories.length} active preferences & standards
                </span>
              </div>
            </label>

            {/* Toggle 2: Before & After Comparison */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={generateComparison}
                onChange={(e) => setGenerateComparison(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
                  Generate Before & After Comparison
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Contrast Generic AI vs Memory-Personalized AI
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={() => {
              setCode('');
              setProjectName('Untitled Python Script');
            }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
              {projectName}.{language === 'python' ? 'py' : language}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({code.split('\n').length} lines)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Monaco Editor • Syntax highlighted
            </span>
          </div>
        </div>

        {/* Monaco Editor Component */}
        <div className="h-[420px] w-full">
          <Editor
            height="100%"
            language={selectedMonacoLang}
            theme={isDark ? 'vs-dark' : 'light'}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true,
              tabSize: 4,
            }}
          />
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>
            {useMemory
              ? `Hindsight will retrieve relevant memories before running Gemini analysis.`
              : 'Running in baseline mode (no memories used).'}
          </span>
        </div>

        <button
          onClick={handleSubmitReview}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Review Code with CodeMind</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Progress Modal */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Analyzing Code</h3>
                <p className="text-xs text-slate-400">Gemini 3.8 Flash + Hindsight Memory</p>
              </div>
            </div>

            {/* Pipeline Step Sequence */}
            <div className="space-y-3">
              {pipelineSteps.map((step, idx) => {
                const isDone = idx < loadingStep;
                const isCurrent = idx === loadingStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-opacity ${
                      isCurrent
                        ? 'text-indigo-400 font-semibold'
                        : isDone
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Processing AST, security rules, and personalized developer preferences...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
