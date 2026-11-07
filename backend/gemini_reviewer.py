"""
Gemini Code Review Agent for FastAPI Backend
Uses google-genai SDK with model gemini-3.8-flash
"""

import os
import json
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class GeminiCodeReviewer:
    def __init__(self, api_key: str = GEMINI_API_KEY):
        self.api_key = api_key
        if self.api_key:
            self.client = genai.Client(
                api_key=self.api_key,
                http_options={"headers": {"User-Agent": "aistudio-build"}},
            )
        else:
            self.client = None

    async def review_code(
        self,
        project_name: str,
        language: str,
        code: str,
        instructions: str = "",
        recalled_memories: Optional[List[Dict[str, Any]]] = None,
        use_memory: bool = True,
    ) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")

        recalled_memories = recalled_memories or []
        memory_text = "\n".join(
            [f"- [{m.get('category', 'preference').upper()}] {m.get('title')}: {m.get('content')}" for m in recalled_memories]
        ) if (use_memory and recalled_memories) else "No previous developer memory provided."

        system_instruction = (
            "You are CodeMind AI, an elite principal software architect and code reviewer. "
            "Analyze the code for syntax, logic, security (OWASP), performance, and adherence to "
            "developer preferences and team standards. "
            "If a section violates the recalled long-term developer memory, flag it and mention the memory. "
            "Do not invent fake bugs. Return clean JSON."
        )

        prompt = f"""PROJECT: {project_name}
LANGUAGE: {language}
INSTRUCTIONS: {instructions}

RECALLED HINDSIGHT MEMORIES:
{memory_text}

SOURCE CODE:
```{language.lower()}
{code}
```

Review this code thoroughly. Return JSON with keys:
- score (0-100)
- summary (string)
- strengths (list of strings)
- keyImprovements (list of strings)
- issues: list of objects with title, severity (Critical|High|Medium|Low), category, location, explanation, whyItIsAProblem, suggestedSolution, correctedCode, relatedMemoryTitle, isMemoryDriven (bool)
- suggestedMemoriesToRetain (list of 1-3 useful extracted developer preferences)
"""

        response = self.client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
            ),
        )

        return json.loads(response.text)
