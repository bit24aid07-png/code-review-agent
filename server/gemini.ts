/**
 * Gemini Code Review Engine
 * Uses @google/genai SDK with gemini-3.8-flash on server-side.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ReviewIssue, ReviewResult, MemoryItem } from '../src/types.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ReviewOptions {
  projectName: string;
  language: string;
  code: string;
  instructions?: string;
  recalledMemories: MemoryItem[];
  useMemory: boolean;
  generateComparison?: boolean;
}

const REVIEW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: 'Overall code health score from 0 to 100 based on bugs, security, performance, and adherence to standards.',
    },
    summary: {
      type: Type.STRING,
      description: 'Executive summary of the code review findings and overall code posture.',
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 2-4 strong practices or positive aspects observed in the code.',
    },
    keyImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of top 2-3 most impactful recommendations.',
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            description: 'Severity level: Critical, High, Medium, or Low',
          },
          category: {
            type: Type.STRING,
            description: 'Category: syntax, logic, bug, security, performance, readability, standards, or architecture',
          },
          location: {
            type: Type.STRING,
            description: 'Exact code line(s) or function name where the issue occurs, e.g. "Lines 12-15 in process_payment()"',
          },
          lineStart: { type: Type.INTEGER },
          lineEnd: { type: Type.INTEGER },
          explanation: {
            type: Type.STRING,
            description: 'Clear, concise explanation of the problem.',
          },
          whyItIsAProblem: {
            type: Type.STRING,
            description: 'Technical explanation of why this creates bugs, leaks resources, risks security, or degrades performance.',
          },
          suggestedSolution: {
            type: Type.STRING,
            description: 'Clear actionable steps to resolve the issue.',
          },
          correctedCode: {
            type: Type.STRING,
            description: 'Pragmatic, working snippet showing the fixed code.',
          },
          relatedMemoryTitle: {
            type: Type.STRING,
            description: 'The title of the developer preference or team standard from long-term memory that informed this issue, if applicable.',
          },
          isMemoryDriven: {
            type: Type.BOOLEAN,
            description: 'True if this issue was flagged or customized based on the recalled developer preferences/standards.',
          },
        },
        required: [
          'title',
          'severity',
          'category',
          'location',
          'explanation',
          'whyItIsAProblem',
          'suggestedSolution',
          'isMemoryDriven',
        ],
      },
      description: 'List of detected issues. Do not invent errors if the code is clean.',
    },
    suggestedMemoriesToRetain: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '1 to 3 useful confirmed developer habits, preferences, or architectural rules extracted from this review suitable for Hindsight retain.',
    },
  },
  required: ['score', 'summary', 'strengths', 'keyImprovements', 'issues', 'suggestedMemoriesToRetain'],
};

export async function performCodeReview(options: ReviewOptions): Promise<ReviewResult> {
  const {
    projectName,
    language,
    code,
    instructions,
    recalledMemories,
    useMemory,
    generateComparison,
  } = options;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.');
  }

  // Build the memory context prompt
  let memoryContextText = 'No long-term memories provided.';
  if (useMemory && recalledMemories.length > 0) {
    memoryContextText = recalledMemories
      .map(
        (m, idx) =>
          `[Memory #${idx + 1} - ${m.category.toUpperCase()}] "${m.title}": ${m.content} (Tags: ${m.tags.join(', ')})`
      )
      .join('\n');
  }

  const systemInstruction = `You are CodeMind AI, an elite principal software architect and intelligent code review agent.
You analyze developer code with surgical precision across 8 core dimensions:
1. Syntax errors
2. Logical errors
3. Bugs & edge-case failures
4. Security vulnerabilities (OWASP Top 10, CWE, credential exposure, injection)
5. Performance bottlenecks & asymptotic inefficiencies
6. Code readability & cognitive complexity
7. Code quality & Pythonic / idiomatic improvements
8. Violations of developer preferences & team coding standards

CRITICAL INSTRUCTIONS ON MEMORY:
${
  useMemory
    ? `The developer has a persistent long-term memory system (Hindsight). You MUST evaluate whether the code honors their remembered preferences, architectural patterns, and team standards.
If a piece of code violates their remembered preference (e.g., missing type hints when they prefer PEP 484, unparameterized queries when team standard dictates parameterized SQL, or nested loops when they prefer comprehensions), flag it explicitly, set "isMemoryDriven": true, and reference the "relatedMemoryTitle".`
    : `Perform a standard baseline review without personal memory bias.`
}

IMPORTANT RULES:
- Do NOT invent false positive errors. If a section is clean or idiomatically sound, acknowledge it.
- Keep location descriptions precise (e.g. "Line 14 in fetch_user_data()").
- Provide realistic, clean corrected code examples.
- Extract 1-3 useful, generalized developer habits or rules for future retain into Hindsight.`;

  const userPrompt = `PROJECT: ${projectName || 'Untitled Codebase'}
PROGRAMMING LANGUAGE: ${language}
${instructions ? `DEVELOPER REVIEW INSTRUCTIONS: ${instructions}` : ''}

RECALLED LONG-TERM MEMORIES (from Hindsight):
${memoryContextText}

CODE UNDER REVIEW:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Analyze the code rigorously and return the structured JSON review report according to the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: REVIEW_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API.');
    }

    const parsed = JSON.parse(text);

    // Normalize issues with unique IDs
    const normalizedIssues: ReviewIssue[] = (parsed.issues || []).map((issue: any, index: number) => ({
      id: issue.id || `issue-${Date.now()}-${index + 1}`,
      title: issue.title || 'Code Quality Observation',
      severity: (['Critical', 'High', 'Medium', 'Low'].includes(issue.severity)
        ? issue.severity
        : 'Medium') as any,
      category: (issue.category || 'quality') as any,
      location: issue.location || `Line ${issue.lineStart || 1}`,
      lineStart: issue.lineStart,
      lineEnd: issue.lineEnd,
      explanation: issue.explanation || '',
      whyItIsAProblem: issue.whyItIsAProblem || '',
      suggestedSolution: issue.suggestedSolution || '',
      correctedCode: issue.correctedCode || '',
      relatedMemoryTitle: issue.relatedMemoryTitle,
      isMemoryDriven: Boolean(issue.isMemoryDriven),
    }));

    // If comparison mode is requested, run a secondary lightweight baseline review without memory
    let baselineComparison;
    if (generateComparison && useMemory) {
      try {
        const baselineResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Review this ${language} code without any developer preferences or team memory:\n\`\`\`${language}\n${code}\n\`\`\``,
          config: {
            systemInstruction:
              'You are a generic automated linter/reviewer with NO memory of the user. Only detect standard syntax or overt logic crashes. Do not apply personalized architectural standards or specific developer preferences.',
            responseMimeType: 'application/json',
            responseSchema: REVIEW_SCHEMA,
          },
        });
        const baselineParsed = JSON.parse(baselineResponse.text || '{}');
        baselineComparison = {
          summary: baselineParsed.summary || 'Generic AI review without personalized preferences.',
          score: baselineParsed.score || Math.min(95, parsed.score + 10),
          issuesCount: (baselineParsed.issues || []).length,
          issues: (baselineParsed.issues || []).map((iss: any, i: number) => ({
            ...iss,
            id: `baseline-${i}`,
            isMemoryDriven: false,
          })),
          differencesExplanation:
            'Without Hindsight memory, standard AI reviewers miss implicit team conventions, specific typing requirements, and repeat architectural patterns that you previously established.',
        };
      } catch (e) {
        console.warn('Comparison baseline generation skipped due to error:', e);
      }
    }

    const reviewResult: ReviewResult = {
      id: `rev-${Date.now()}`,
      projectName: projectName || 'Python Service',
      language,
      code,
      timestamp: new Date().toISOString(),
      score: Math.max(0, Math.min(100, parsed.score || 75)),
      summary: parsed.summary || 'Code review completed successfully.',
      issues: normalizedIssues,
      strengths: parsed.strengths || [],
      keyImprovements: parsed.keyImprovements || [],
      recalledMemories: useMemory ? recalledMemories : [],
      suggestedMemoriesToRetain: parsed.suggestedMemoriesToRetain || [],
      hindsightConnected: recalledMemories.some((m) => m.syncedToHindsight),
      isComparison: Boolean(generateComparison),
      baselineComparison,
    };

    return reviewResult;
  } catch (error: any) {
    console.error('Error in performCodeReview:', error);
    throw new Error(error.message || 'Failed to complete code review analysis.');
  }
}
