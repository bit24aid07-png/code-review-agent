import React, { useState } from 'react';
import {
  BrainCircuit,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Server,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import { MemoryItem, MemoryCategory, SystemStatus } from '../types.js';
import { retainMemory, deleteMemory, recallMemoriesQuery } from '../services/api.js';

interface Props {
  memories: MemoryItem[];
  status: SystemStatus | null;
  onRefreshMemories: () => void;
  onOpenStatusModal: () => void;
}

export const MemoryPage: React.FC<Props> = ({
  memories,
  status,
  onRefreshMemories,
  onOpenStatusModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');
  const [newTags, setNewTags] = useState('python, clean-code');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Test Recall Playground State
  const [recallTestQuery, setRecallTestQuery] = useState('');
  const [recallTestResults, setRecallTestResults] = useState<{
    memories: MemoryItem[];
    hindsightConnected: boolean;
    source: string;
  } | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);

  const isConnected = status?.hindsight?.connected;

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await retainMemory({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source: 'manual',
      });

      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewContent('');
      onRefreshMemories();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Failed to retain memory in Hindsight.');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      try {
        await deleteMemory(id);
        onRefreshMemories();
      } catch (err) {
        console.error('Failed to delete memory:', err);
      }
    }
  };

  const handleTestRecall = async () => {
    if (!recallTestQuery.trim()) return;
    setIsRecalling(true);
    try {
      const res = await recallMemoriesQuery(recallTestQuery, 4);
      setRecallTestResults(res);
    } catch (err) {
      console.error('Test recall failed:', err);
    } finally {
      setIsRecalling(false);
    }
  };

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    if (selectedCategory !== 'all' && mem.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        mem.title.toLowerCase().includes(q) ||
        mem.content.toLowerCase().includes(q) ||
        mem.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <span>Developer Long-Term Memory</span>
            </h1>
            <span
              onClick={onOpenStatusModal}
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}
            >
              {isConnected ? 'Hindsight Live' : 'Local Standby'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage remembered developer preferences, architectural rules, and team standards.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Preference to Hindsight</span>
        </button>
      </div>

      {/* Memory Engine Architecture Explainer Card */}
      <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <div className="flex items-center justify-between font-semibold text-violet-900 dark:text-violet-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Distinction between Hindsight and Application Data
          </span>
          <button
            onClick={onOpenStatusModal}
            className="text-[11px] underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
          >
            Diagnostics
          </button>
        </div>
        <p className="leading-relaxed">
          Memories badged with <span className="font-semibold text-emerald-600 dark:text-emerald-400">[Hindsight Synced]</span> are
          persisted in the external biomimetic memory engine via official <code className="font-mono text-violet-700 dark:text-violet-300">retain</code> endpoints.
          When Hindsight is offline, memories are safely maintained in the local standby bank <span className="font-semibold text-amber-600 dark:text-amber-400">[Local Standby]</span> with
          transparent status badges so development never halts.
        </p>
      </div>

      {/* Interactive Hindsight Recall Playground */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current" />
            Interactive Recall Playground
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Test What Hindsight Recalls For Any Query
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Type code concepts or questions to test the multi-strategy recall ranking before reviewing code.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={recallTestQuery}
              onChange={(e) => setRecallTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestRecall()}
              placeholder="e.g., 'Python loop formatting', 'database injection', 'FastAPI typing'..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleTestRecall}
            disabled={isRecalling || !recallTestQuery.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRecalling ? 'Recalling...' : 'Test Recall'}
          </button>
        </div>

        {recallTestResults && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Recall Source: <strong className="text-slate-700 dark:text-slate-300">{recallTestResults.source}</strong>
              </span>
              <span>{recallTestResults.memories.length} matches retrieved</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recallTestResults.memories.map((mem, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-indigo-50/40 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {mem.title}
                    </span>
                    {typeof mem.relevanceScore === 'number' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                        {(mem.relevanceScore * 100).toFixed(0)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {mem.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory Catalog Controls & Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All Memories (${memories.length})` },
              { id: 'preference', label: 'Preferences' },
              { id: 'standard', label: 'Team Standards' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'feedback', label: 'Past Feedback' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter memories..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Memory Grid */}
        {filteredMemories.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 space-y-2">
            <BrainCircuit className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No Memories Found
            </h3>
            <p className="text-xs">
              No developer memories match your filter. Click &quot;Add Preference to Hindsight&quot; to retain one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          {mem.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            mem.syncedToHindsight
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {mem.syncedToHindsight ? 'Hindsight Synced' : 'Local Standby'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {mem.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      title="Remove this memory"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mem.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex flex-wrap gap-1">
                    {mem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Source: {mem.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Retain Memory in Hindsight</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Preference or Standard Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Always Use Type Hints (PEP 484)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="preference">Developer Preference</option>
                    <option value="standard">Team Coding Standard</option>
                    <option value="architecture">Architecture Decision</option>
                    <option value="feedback">Previous Review Feedback</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="python, types, pep484"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Rule or Instruction
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the exact coding preference. e.g.: 'For Python projects, always use typing.Optional for nullable fields, use snake_case for functions, and avoid nested loops deeper than 2 levels.'"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                This memory will be stored in your Hindsight bank. During future reviews, CodeMind will automatically recall it and evaluate code accordingly.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Retaining...' : 'Retain in Hindsight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
