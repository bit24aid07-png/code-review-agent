import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, Search, Tag, X, FileCode2 } from 'lucide-react';
import { TeamStandard } from '../types.js';
import { updateTeamStandard, addTeamStandard } from '../services/api.js';

interface Props {
  standards: TeamStandard[];
  onRefreshStandards: () => void;
}

export const CodingStandardsPage: React.FC<Props> = ({
  standards,
  onRefreshStandards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Security');
  const [language, setLanguage] = useState('Python');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async (standard: TeamStandard) => {
    try {
      await updateTeamStandard(standard.id, { enabled: !standard.enabled });
      onRefreshStandards();
    } catch (err) {
      console.error('Failed to update standard status:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await addTeamStandard({
        name,
        category,
        language,
        description,
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
      onRefreshStandards();
    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to add standard:', err);
    }
  };

  const filtered = standards.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Team Coding Standards</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global architectural and quality standards injected into Gemini review prompts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Standard Rule</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search standards..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {standards.filter((s) => s.enabled).length} of {standards.length} active
        </span>
      </div>

      {/* Standards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((std) => (
          <div
            key={std.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
              std.enabled
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs'
                : 'border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {std.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {std.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {std.name}
                  </h3>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={std.enabled}
                    onChange={() => handleToggle(std)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {std.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-[10px]">Rule: {std.ruleCode}</span>
              <span
                className={`font-semibold ${
                  std.enabled
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {std.enabled ? 'Enforced in Reviews' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Team Coding Standard</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Strict Null Checking"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Security">Security</option>
                    <option value="Performance">Performance</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Quality">Code Quality</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="All">All Languages</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the rule enforces and why..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-800/80 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
