export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueCategory =
  | 'syntax'
  | 'logic'
  | 'bug'
  | 'security'
  | 'performance'
  | 'readability'
  | 'standards'
  | 'architecture';

export interface ReviewIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  category: IssueCategory;
  location: string;
  lineStart?: number;
  lineEnd?: number;
  explanation: string;
  whyItIsAProblem: string;
  suggestedSolution: string;
  correctedCode?: string;
  relatedMemoryTitle?: string;
  isMemoryDriven?: boolean;
}

export interface ReviewResult {
  id: string;
  projectName: string;
  language: string;
  code: string;
  timestamp: string;
  score: number; // 0-100
  summary: string;
  issues: ReviewIssue[];
  strengths: string[];
  keyImprovements: string[];
  recalledMemories: MemoryItem[];
  suggestedMemoriesToRetain: string[];
  hindsightConnected: boolean;
  isComparison?: boolean;
  baselineComparison?: {
    summary: string;
    score: number;
    issuesCount: number;
    issues: ReviewIssue[];
    differencesExplanation: string;
  };
}

export type MemoryCategory =
  | 'preference'
  | 'standard'
  | 'architecture'
  | 'feedback';

export interface MemoryItem {
  id: string;
  bankId: string;
  title: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  createdAt: string;
  syncedToHindsight: boolean;
  source: 'manual' | 'extracted_from_review' | 'team_seed';
  relevanceScore?: number;
}

export interface TeamStandard {
  id: string;
  name: string;
  language: string;
  category: string;
  description: string;
  enabled: boolean;
  ruleCode?: string;
}

export interface SystemStatus {
  geminiReady: boolean;
  hindsight: {
    connected: boolean;
    url: string;
    bankId: string;
    mode: 'hindsight-live' | 'local-standby';
    message: string;
    lastPing?: string;
  };
  totalReviews: number;
  totalMemories: number;
}
