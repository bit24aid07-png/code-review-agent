import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkHindsightHealth,
  getAllMemories,
  retainMemory,
  recallMemories,
  deleteMemory,
  updateMemory,
} from './server/hindsight.js';
import { performCodeReview } from './server/gemini.js';
import { ReviewResult, TeamStandard } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent review history
let reviewHistory: ReviewResult[] = [
  {
    id: 'rev-sample-1',
    projectName: 'FastAPI Microservice Auth',
    language: 'Python',
    code: `def get_user_by_id(user_id):\n    # Direct query string construction\n    query = f"SELECT * FROM users WHERE id = '{user_id}'"\n    res = db.execute(query)\n    return res.fetchone()`,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    score: 42,
    summary:
      'Critical security vulnerability detected: SQL injection risk due to f-string formatting in SQL query. Also violated team preference for explicit PEP 484 type annotations.',
    issues: [
      {
        id: 'iss-1',
        title: 'SQL Injection Vulnerability via Raw f-string Formatting',
        severity: 'Critical',
        category: 'security',
        location: 'Line 3 in get_user_by_id()',
        explanation:
          'Constructing SQL queries using f-strings allows untrusted input from user_id to escape SQL syntax and execute arbitrary queries.',
        whyItIsAProblem:
          'Attackers can extract confidential tables, modify data, or bypass authentication through crafted inputs like `\' OR \'1\'=\'1`.',
        suggestedSolution: 'Use parameterized queries with SQLAlchemy text() or ORM query filters.',
        correctedCode: `from sqlalchemy import text\nfrom typing import Optional, Dict, Any\n\ndef get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:\n    query = text("SELECT * FROM users WHERE id = :user_id")\n    res = db.execute(query, {"user_id": user_id})\n    return res.mappings().first()`,
        relatedMemoryTitle: 'SQLAlchemy / DB Query Parameterization',
        isMemoryDriven: true,
      },
      {
        id: 'iss-2',
        title: 'Missing PEP 484 Type Annotations',
        severity: 'Low',
        category: 'standards',
        location: 'Line 1: def get_user_by_id(user_id)',
        explanation: 'Function parameter user_id and return value have no type hints.',
        whyItIsAProblem:
          'Violates remembered developer preference for strict type annotations, reducing IDE auto-completion and static analysis via mypy.',
        suggestedSolution: 'Add user_id: int and return type -> Optional[User].',
        correctedCode: 'def get_user_by_id(user_id: int) -> Optional[User]:',
        relatedMemoryTitle: 'Python Type Hints & PEP 484',
        isMemoryDriven: true,
      },
    ],
    strengths: ['Function name is descriptive and concise.'],
    keyImprovements: [
      'Replace string interpolation with parameterized queries immediately.',
      'Adopt type hints across all repository access functions.',
    ],
    recalledMemories: getAllMemories().slice(0, 3),
    suggestedMemoriesToRetain: [
      'Always audit raw database query helpers for injection safety.',
    ],
    hindsightConnected: false,
  },
];

// Team coding standards catalog
let teamStandards: TeamStandard[] = [
  {
    id: 'std-1',
    name: 'PEP 484 Strict Type Hints',
    language: 'Python',
    category: 'Readability & Tooling',
    description: 'Enforce type hints for every function parameter and return type. Disallow implicit Any.',
    enabled: true,
    ruleCode: 'PEP-484-STRICT',
  },
  {
    id: 'std-2',
    name: 'OWASP SQL & Command Injection Guard',
    language: 'Python',
    category: 'Security',
    description: 'Mandate parameterized database queries and prepared statements. Never format SQL strings.',
    enabled: true,
    ruleCode: 'OWASP-A03-INJECTION',
  },
  {
    id: 'std-3',
    name: 'Comprehensions over Nested Loops',
    language: 'Python',
    category: 'Performance',
    description: 'Flag any loop nesting deeper than 2 levels. Suggest generator expressions or vectorized NumPy/Pandas operations.',
    enabled: true,
    ruleCode: 'PERF-LOOP-COMPLEXITY',
  },
  {
    id: 'std-4',
    name: 'Context Manager Resource Discipline',
    language: 'Python',
    category: 'Robustness',
    description: 'Enforce `with` statement context managers for all open() file operations, database transactions, and lock acquisitions.',
    enabled: true,
    ruleCode: 'RES-CONTEXT-MGR',
  },
  {
    id: 'std-5',
    name: 'Explicit Exception Handling',
    language: 'Python',
    category: 'Quality',
    description: 'Reject bare `except:` clauses. Require catching explicit exceptions with appropriate logging.',
    enabled: true,
    ruleCode: 'ERR-SPECIFIC-CATCH',
  },
];

/* -------------------------------------------------------------------------- */
/* API ROUTES                                                                 */
/* -------------------------------------------------------------------------- */

// Health & System Status
app.get('/api/status', async (_req, res) => {
  const hindsightStatus = await checkHindsightHealth();
  const memories = getAllMemories();

  res.json({
    geminiReady: Boolean(process.env.GEMINI_API_KEY),
    hindsight: hindsightStatus,
    totalReviews: reviewHistory.length,
    totalMemories: memories.length,
  });
});

// Perform Code Review with Memory Recall
app.post('/api/review', async (req, res) => {
  try {
    const {
      projectName = 'Python Project',
      language = 'Python',
      code,
      instructions = '',
      useMemory = true,
      generateComparison = false,
      bankId,
    } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Source code is required for review.' });
    }

    if (code.length > 80000) {
      return res.status(400).json({ error: 'Code file exceeds maximum supported size (80KB).' });
    }

    // Step 1: Recall relevant memories from Hindsight (or local store)
    let recalledMemories: any[] = [];
    let hindsightConnected = false;

    if (useMemory) {
      const recallQuery = `${instructions} ${code.slice(0, 1500)}`;
      const recallResult = await recallMemories(recallQuery, bankId, 5);
      recalledMemories = recallResult.memories;
      hindsightConnected = recallResult.hindsightConnected;
    }

    // Step 2: Perform analysis with Gemini
    const reviewResult = await performCodeReview({
      projectName,
      language,
      code,
      instructions,
      recalledMemories,
      useMemory,
      generateComparison,
    });

    // Save to history
    reviewHistory.unshift(reviewResult);

    res.json(reviewResult);
  } catch (error: any) {
    console.error('Review endpoint failed:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during code analysis.',
    });
  }
});

// Get all Memories
app.get('/api/memories', (_req, res) => {
  const memories = getAllMemories();
  res.json(memories);
});

// Retain a new memory
app.post('/api/memory/retain', async (req, res) => {
  try {
    const { title, content, category, tags = [], source = 'manual', bankId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required to retain a memory.' });
    }

    const memory = await retainMemory(title, content, category, tags, source, bankId);
    res.json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retain memory.' });
  }
});

// Recall memories (query playground)
app.post('/api/memory/recall', async (req, res) => {
  try {
    const { query, bankId, limit = 5 } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const result = await recallMemories(query, bankId, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to recall memories.' });
  }
});

// Delete memory
app.delete('/api/memories/:id', (req, res) => {
  const deleted = deleteMemory(req.params.id);
  if (deleted) {
    res.json({ success: true, message: 'Memory removed successfully.' });
  } else {
    res.status(404).json({ error: 'Memory item not found.' });
  }
});

// Update memory
app.patch('/api/memories/:id', (req, res) => {
  const updated = updateMemory(req.params.id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Memory item not found.' });
  }
});

// Review History
app.get('/api/history', (_req, res) => {
  res.json(reviewHistory);
});

app.get('/api/history/:id', (req, res) => {
  const item = reviewHistory.find((r) => r.id === req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Review not found.' });
  }
});

app.delete('/api/history/:id', (req, res) => {
  const idx = reviewHistory.findIndex((r) => r.id === req.params.id);
  if (idx !== -1) {
    reviewHistory.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Review not found.' });
  }
});

// Standards
app.get('/api/standards', (_req, res) => {
  res.json(teamStandards);
});

app.post('/api/standards', (req, res) => {
  const { name, language, category, description, enabled = true, ruleCode } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  const standard: TeamStandard = {
    id: `std-${Date.now()}`,
    name,
    language: language || 'Python',
    category: category || 'General',
    description,
    enabled,
    ruleCode: ruleCode || `STD-${Date.now().toString().slice(-4)}`,
  };

  teamStandards.push(standard);
  res.json(standard);
});

app.patch('/api/standards/:id', (req, res) => {
  const standard = teamStandards.find((s) => s.id === req.params.id);
  if (standard) {
    Object.assign(standard, req.body);
    res.json(standard);
  } else {
    res.status(404).json({ error: 'Standard not found.' });
  }
});

/* -------------------------------------------------------------------------- */
/* VITE DEV SERVER MOUNT & STATIC SERVE                                      */
/* -------------------------------------------------------------------------- */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CodeMind AI] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CodeMind AI] Fatal server error:', err);
  process.exit(1);
});
