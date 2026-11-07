import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  History,
  BrainCircuit,
  ShieldCheck,
  GitCompare,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'new-review'
  | 'history'
  | 'memory'
  | 'standards'
  | 'comparison'
  | 'settings';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  memoryCount: number;
  reviewCount: number;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  memoryCount,
  reviewCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'new-review' as NavTab,
      label: 'New Code Review',
      icon: FileCode2,
      highlight: true,
    },
    {
      id: 'comparison' as NavTab,
      label: 'Before & After Demo',
      icon: GitCompare,
      badge: 'Interactive',
    },
    {
      id: 'memory' as NavTab,
      label: 'Developer Memory',
      icon: BrainCircuit,
      count: memoryCount,
    },
    {
      id: 'standards' as NavTab,
      label: 'Coding Standards',
      icon: ShieldCheck,
    },
    {
      id: 'history' as NavTab,
      label: 'Review History',
      icon: History,
      count: reviewCount,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Guide',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between p-3 shrink-0 select-none">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Hindsight Info Box */}
        <div className="mx-1 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-linear-to-b from-indigo-50/70 to-white dark:from-indigo-950/20 dark:to-slate-900/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Memory Architecture</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Hindsight retains confirmed developer preferences, so future reviews adapt to your exact style over time.
          </p>
        </div>
      </div>

      {/* User / Agent Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 px-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span className="truncate">CodeMind AI v1.0</span>
        <span className="font-mono text-[10px] text-slate-400">Node+FastAPI</span>
      </div>
    </aside>
  );
};
