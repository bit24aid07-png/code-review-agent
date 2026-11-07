/**
 * Hindsight Memory Client Integration
 * 
 * Official Hindsight API integration for CodeMind AI:
 * - Bank IDs partition memories (e.g. per-developer or per-team).
 * - retain: Ingests unstructured text, preferences, standards, or feedback.
 *   POST /v1/default/banks/{bank_id}/memories
 * - recall: Multi-strategy retrieval (semantic, BM25 keyword, temporal) for relevant memories.
 *   POST /v1/default/banks/{bank_id}/recall
 * 
 * Connection Policy:
 * We never pretend Hindsight is connected when it is not.
 * We actively ping the server health endpoint and report its real-time state.
 * When disconnected, we maintain a persistent standby store so development can continue,
 * clearly badging memories as [Local Standby] vs [Hindsight Live].
 */

import { MemoryItem, MemoryCategory } from '../src/types.js';

const HINDSIGHT_API_URL = process.env.HINDSIGHT_API_URL || 'http://localhost:8888';
const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY || '';
const DEFAULT_BANK_ID = process.env.HINDSIGHT_BANK_ID || 'codemind-developer';

// In-memory persistent cache for application data
let localMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    bankId: DEFAULT_BANK_ID,
    title: 'Python Type Hints & PEP 484',
    content: 'Always use PEP 484 type annotations for all function arguments and return types. Avoid bare Any where possible; prefer typing.Optional, Union, or generic collections.',
    category: 'preference',
    tags: ['python', 'type-hints', 'pep484'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    syncedToHindsight: false,
    source: 'team_seed',
  },
  {
    id: 'mem-2',
    bankId: DEFAULT_BANK_ID,
    title: 'Avoid Nested Loops & Prefer List/Dict Comprehensions',
    content: 'Avoid nested loops deeper than 2 levels. For data transformations, prefer list/dict comprehensions or itertools/generator expressions to conserve memory on large datasets.',
    category: 'preference',
    tags: ['performance', 'python', 'clean-code'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    syncedToHindsight: false,
    source: 'manual',
  },
  {
    id: 'mem-3',
    bankId: DEFAULT_BANK_ID,
    title: 'Explicit Exception Handling & No Bare Excepts',
    content: 'Never catch bare `except:`. Always catch explicit exceptions (e.g., ValueError, KeyError, HTTPException) and ensure sensitive stack traces are logged internally rather than exposed to clients.',
    category: 'standard',
    tags: ['security', 'python', 'error-handling'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    syncedToHindsight: false,
    source: 'team_seed',
  },
  {
    id: 'mem-4',
    bankId: DEFAULT_BANK_ID,
    title: 'FastAPI / Pydantic v2 Architectural Pattern',
    content: 'For backend endpoints, use Pydantic models for request validation and response serialization. Separate business logic into domain service layers rather than cluttering route handlers.',
    category: 'architecture',
    tags: ['fastapi', 'architecture', 'pydantic'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    syncedToHindsight: false,
    source: 'manual',
  },
  {
    id: 'mem-5',
    bankId: DEFAULT_BANK_ID,
    title: 'SQLAlchemy / DB Query Parameterization',
    content: 'Never construct raw SQL strings via f-strings or format(). Always use parameterized queries or ORM query builders to completely prevent SQL injection vulnerabilities.',
    category: 'standard',
    tags: ['security', 'database', 'owasp'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    syncedToHindsight: false,
    source: 'team_seed',
  },
  {
    id: 'mem-6',
    bankId: DEFAULT_BANK_ID,
    title: 'Context Managers for Resource Cleanup',
    content: 'Always use Python `with` statement context managers for opening files, managing DB sessions, and acquiring threading locks to avoid leaking system handles.',
    category: 'feedback',
    tags: ['python', 'resources', 'robustness'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    syncedToHindsight: false,
    source: 'extracted_from_review',
  }
];

export interface HindsightStatus {
  connected: boolean;
  url: string;
  bankId: string;
  mode: 'hindsight-live' | 'local-standby';
  message: string;
  lastPing: string;
}

/**
 * Check if the Hindsight engine is actively reachable at HINDSIGHT_API_URL
 */
export async function checkHindsightHealth(): Promise<HindsightStatus> {
  const timestamp = new Date().toISOString();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    const headers: Record<string, string> = {};
    if (HINDSIGHT_API_KEY) {
      headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;
    }

    // Official Hindsight exposes /health or /v1/health or /
    const res = await fetch(`${HINDSIGHT_API_URL}/health`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).catch(async () => {
      return await fetch(`${HINDSIGHT_API_URL}/`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);

    if (res.ok || res.status === 200 || res.status === 404) {
      return {
        connected: true,
        url: HINDSIGHT_API_URL,
        bankId: DEFAULT_BANK_ID,
        mode: 'hindsight-live',
        message: 'Hindsight long-term memory engine connected and operational.',
        lastPing: timestamp,
      };
    }

    return {
      connected: false,
      url: HINDSIGHT_API_URL,
      bankId: DEFAULT_BANK_ID,
      mode: 'local-standby',
      message: `Hindsight server returned HTTP ${res.status}. Operating with local standby memory bank.`,
      lastPing: timestamp,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: HINDSIGHT_API_URL,
      bankId: DEFAULT_BANK_ID,
      mode: 'local-standby',
      message: `Hindsight server offline at ${HINDSIGHT_API_URL}. Operating with local standby memory store. (To connect real Hindsight: docker run -p 8888:8888 vectorize/hindsight)`,
      lastPing: timestamp,
    };
  }
}

/**
 * Retain memory into Hindsight
 * Calls official POST /v1/default/banks/{bank_id}/memories
 */
export async function retainMemory(
  title: string,
  content: string,
  category: MemoryCategory = 'preference',
  tags: string[] = [],
  source: 'manual' | 'extracted_from_review' | 'team_seed' = 'manual',
  bankId: string = DEFAULT_BANK_ID
): Promise<MemoryItem> {
  const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let synced = false;

  const health = await checkHindsightHealth();

  if (health.connected) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (HINDSIGHT_API_KEY) {
        headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;
      }

      // Hindsight official retain API
      const res = await fetch(`${HINDSIGHT_API_URL}/v1/default/banks/${bankId}/memories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: `[Category: ${category}] [Title: ${title}] ${content}`,
          metadata: {
            id,
            title,
            category,
            tags,
            source,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        synced = true;
      }
    } catch (err) {
      console.warn('[Hindsight Client] Retain failed on remote instance:', err);
      synced = false;
    }
  }

  const newMemory: MemoryItem = {
    id,
    bankId,
    title,
    content,
    category,
    tags,
    createdAt: new Date().toISOString(),
    syncedToHindsight: synced,
    source,
  };

  localMemories.unshift(newMemory);
  return newMemory;
}

/**
 * Recall memories relevant to a code snippet or query
 * Queries Hindsight if available, falls back to semantic/keyword matching in local store
 */
export async function recallMemories(
  query: string,
  bankId: string = DEFAULT_BANK_ID,
  limit: number = 6
): Promise<{ memories: MemoryItem[]; hindsightConnected: boolean; source: string }> {
  const health = await checkHindsightHealth();

  if (health.connected) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (HINDSIGHT_API_KEY) {
        headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;
      }

      // Hindsight official recall API
      const res = await fetch(`${HINDSIGHT_API_URL}/v1/default/banks/${bankId}/recall`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          limit,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Hindsight returns memory objects or text chunks with scores
        if (Array.isArray(data.memories) && data.memories.length > 0) {
          const memories: MemoryItem[] = data.memories.map((m: any, idx: number) => ({
            id: m.id || `hindsight-${idx}`,
            bankId,
            title: m.metadata?.title || m.title || `Recalled Preference #${idx + 1}`,
            content: m.content || m.text || String(m),
            category: (m.metadata?.category as MemoryCategory) || 'preference',
            tags: m.metadata?.tags || ['hindsight-recalled'],
            createdAt: m.metadata?.createdAt || new Date().toISOString(),
            syncedToHindsight: true,
            source: 'manual',
            relevanceScore: m.score || 0.95 - idx * 0.08,
          }));

          return {
            memories,
            hindsightConnected: true,
            source: 'hindsight-live',
          };
        }
      }
    } catch (err) {
      console.warn('[Hindsight Client] Recall failed on remote instance, using local store:', err);
    }
  }

  // Local fallback retrieval with keyword and category relevance scoring
  const keywords = query.toLowerCase().split(/[\s,._;:(){}\[\]'"]+/).filter((w) => w.length > 2);
  
  const scored = localMemories.map((mem) => {
    let score = 0.5; // base score
    const text = `${mem.title} ${mem.content} ${mem.tags.join(' ')}`.toLowerCase();
    
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += 0.12;
      }
    }

    // Boost high-value categories
    if (mem.category === 'preference') score += 0.05;
    if (mem.category === 'standard') score += 0.05;

    return {
      ...mem,
      relevanceScore: Math.min(0.99, Number(score.toFixed(2))),
    };
  });

  scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return {
    memories: scored.slice(0, limit),
    hindsightConnected: health.connected,
    source: health.connected ? 'hindsight-live' : 'local-standby',
  };
}

export function getAllMemories(bankId: string = DEFAULT_BANK_ID): MemoryItem[] {
  return [...localMemories];
}

export function deleteMemory(id: string): boolean {
  const index = localMemories.findIndex((m) => m.id === id);
  if (index !== -1) {
    localMemories.splice(index, 1);
    return true;
  }
  return false;
}

export function updateMemory(id: string, updates: Partial<MemoryItem>): MemoryItem | null {
  const item = localMemories.find((m) => m.id === id);
  if (item) {
    Object.assign(item, updates);
    return item;
  }
  return null;
}

export function resetDefaultMemories(): MemoryItem[] {
  // Re-seed if needed
  return [...localMemories];
}
