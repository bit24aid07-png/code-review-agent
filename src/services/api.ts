import {
  ReviewResult,
  MemoryItem,
  SystemStatus,
  TeamStandard,
  MemoryCategory,
} from '../types.js';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function submitCodeReview(payload: {
  projectName: string;
  language: string;
  code: string;
  instructions?: string;
  useMemory: boolean;
  generateComparison?: boolean;
  bankId?: string;
}): Promise<ReviewResult> {
  const res = await fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Review failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchMemories(): Promise<MemoryItem[]> {
  const res = await fetch('/api/memories');
  if (!res.ok) throw new Error('Failed to fetch memories');
  return res.json();
}

export async function retainMemory(payload: {
  title: string;
  content: string;
  category: MemoryCategory;
  tags?: string[];
  source?: 'manual' | 'extracted_from_review' | 'team_seed';
  bankId?: string;
}): Promise<MemoryItem> {
  const res = await fetch('/api/memory/retain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to retain memory');
  }

  return res.json();
}

export async function recallMemoriesQuery(
  query: string,
  limit: number = 5
): Promise<{ memories: MemoryItem[]; hindsightConnected: boolean; source: string }> {
  const res = await fetch('/api/memory/recall', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) throw new Error('Failed to recall memories');
  return res.json();
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete memory');
}

export async function fetchReviewHistory(): Promise<ReviewResult[]> {
  const res = await fetch('/api/history');
  if (!res.ok) throw new Error('Failed to fetch review history');
  return res.json();
}

export async function fetchReviewById(id: string): Promise<ReviewResult> {
  const res = await fetch(`/api/history/${id}`);
  if (!res.ok) throw new Error('Failed to fetch review item');
  return res.json();
}

export async function deleteReviewHistory(id: string): Promise<void> {
  const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete review');
}

export async function fetchTeamStandards(): Promise<TeamStandard[]> {
  const res = await fetch('/api/standards');
  if (!res.ok) throw new Error('Failed to fetch team standards');
  return res.json();
}

export async function updateTeamStandard(
  id: string,
  updates: Partial<TeamStandard>
): Promise<TeamStandard> {
  const res = await fetch(`/api/standards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update standard');
  return res.json();
}

export async function addTeamStandard(payload: {
  name: string;
  language: string;
  category: string;
  description: string;
}): Promise<TeamStandard> {
  const res = await fetch('/api/standards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add standard');
  return res.json();
}
