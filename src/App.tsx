import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { HindsightStatusModal } from './components/HindsightStatusModal.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NewReviewPage } from './pages/NewReviewPage.js';
import { ReviewResultPage } from './pages/ReviewResultPage.js';
import { MemoryPage } from './pages/MemoryPage.js';
import { CodingStandardsPage } from './pages/CodingStandardsPage.js';
import { ReviewHistoryPage } from './pages/ReviewHistoryPage.js';
import { ComparisonDemoPage } from './pages/ComparisonDemoPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

import {
  ReviewResult,
  MemoryItem,
  SystemStatus,
  TeamStandard,
} from './types.js';
import {
  fetchSystemStatus,
  fetchMemories,
  fetchReviewHistory,
  fetchTeamStandards,
} from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedReview, setSelectedReview] = useState<ReviewResult | null>(null);

  // Prefilled code for New Review page
  const [prefillCode, setPrefillCode] = useState<string | undefined>();
  const [prefillName, setPrefillName] = useState<string | undefined>();

  // Data state
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewResult[]>([]);
  const [standards, setStandards] = useState<TeamStandard[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Theme state: dark by default for developer IDE aesthetic
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const loadData = async () => {
    try {
      const [sysStatus, mems, revs, stds] = await Promise.all([
        fetchSystemStatus().catch(() => null),
        fetchMemories().catch(() => []),
        fetchReviewHistory().catch(() => []),
        fetchTeamStandards().catch(() => []),
      ]);

      if (sysStatus) setStatus(sysStatus);
      setMemories(mems);
      setReviews(revs);
      setStandards(stds);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Periodic refresh for Hindsight status
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchNewReview = (code?: string, name?: string) => {
    setPrefillCode(code);
    setPrefillName(name);
    setSelectedReview(null);
    setCurrentTab('new-review');
  };

  const handleReviewCompleted = (result: ReviewResult) => {
    setSelectedReview(result);
    // Reload history & memories (Gemini might have extracted memories)
    loadData();
  };

  const handleSelectReviewFromHistory = (review: ReviewResult) => {
    setSelectedReview(review);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        status={status}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onNavigateNewReview={() => handleLaunchNewReview()}
      />

      {/* Main Container with Sidebar + Page View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setSelectedReview(null);
          }}
          memoryCount={memories.length}
          reviewCount={reviews.length}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {selectedReview ? (
            <ReviewResultPage
              result={selectedReview}
              onBackToNewReview={() => {
                setSelectedReview(null);
                setCurrentTab('new-review');
              }}
              onMemoryRetained={loadData}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  reviews={reviews}
                  memories={memories}
                  status={status}
                  onNavigateNewReview={handleLaunchNewReview}
                  onSelectReview={handleSelectReviewFromHistory}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenStatusModal={() => setIsStatusModalOpen(true)}
                />
              )}

              {currentTab === 'new-review' && (
                <NewReviewPage
                  initialCode={prefillCode}
                  initialProjectName={prefillName}
                  isDark={isDark}
                  memories={memories}
                  onReviewCompleted={handleReviewCompleted}
                  onOpenStatusModal={() => setIsStatusModalOpen(true)}
                />
              )}

              {currentTab === 'comparison' && (
                <ComparisonDemoPage
                  onLaunchLiveReview={(code, name) => handleLaunchNewReview(code, name)}
                />
              )}

              {currentTab === 'memory' && (
                <MemoryPage
                  memories={memories}
                  status={status}
                  onRefreshMemories={loadData}
                  onOpenStatusModal={() => setIsStatusModalOpen(true)}
                />
              )}

              {currentTab === 'standards' && (
                <CodingStandardsPage
                  standards={standards}
                  onRefreshStandards={loadData}
                />
              )}

              {currentTab === 'history' && (
                <ReviewHistoryPage
                  reviews={reviews}
                  onSelectReview={handleSelectReviewFromHistory}
                  onRefreshHistory={loadData}
                  onNavigateNewReview={() => handleLaunchNewReview()}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsPage
                  status={status}
                  onRefreshStatus={loadData}
                  onOpenStatusModal={() => setIsStatusModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Hindsight Status & Diagnostics Modal */}
      <HindsightStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        status={status}
        onRefresh={loadData}
      />
    </div>
  );
}
