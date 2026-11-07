"""
Hindsight Long-Term Memory Client for CodeMind AI (Python / FastAPI)

This module implements the official Hindsight integration:
- Bank Isolation: Separate memories by bank_id (e.g. developer, team, or project)
- Retain: Store developer habits, architectural standards, and past review lessons
- Recall: Retrieve contextually relevant memories before new code reviews
- Connection Diagnostics: Transparently reports whether Hindsight is live or in standby
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

HINDSIGHT_API_URL = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY", "")
DEFAULT_BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "codemind-developer")


class HindsightClient:
    def __init__(self, base_url: str = HINDSIGHT_API_URL, api_key: str = HINDSIGHT_API_KEY):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        # Local fallback store for offline development
        self.fallback_memories: List[Dict[str, Any]] = [
            {
                "id": "py-mem-1",
                "bank_id": DEFAULT_BANK_ID,
                "title": "PEP 484 Type Annotations",
                "content": "Always annotate function arguments and return types. Prefer typing.Optional and Union over Any.",
                "category": "preference",
                "tags": ["python", "type-hints", "pep484"],
                "created_at": datetime.utcnow().isoformat(),
                "synced_to_hindsight": False,
            },
            {
                "id": "py-mem-2",
                "bank_id": DEFAULT_BANK_ID,
                "title": "SQL Injection Prevention",
                "content": "Never format or concatenate raw SQL query strings. Always use parameterized queries.",
                "category": "standard",
                "tags": ["security", "sql", "owasp"],
                "created_at": datetime.utcnow().isoformat(),
                "synced_to_hindsight": False,
            },
        ]

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def check_health(self) -> Dict[str, Any]:
        """Verify if Hindsight is reachable. Never fake connection status."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/health", headers=self._get_headers())
                if res.status_code in [200, 404]:
                    return {
                        "connected": True,
                        "url": self.base_url,
                        "bank_id": DEFAULT_BANK_ID,
                        "mode": "hindsight-live",
                        "message": "Official Hindsight service active.",
                    }
        except Exception as e:
            pass

        return {
            "connected": False,
            "url": self.base_url,
            "bank_id": DEFAULT_BANK_ID,
            "mode": "local-standby",
            "message": f"Hindsight unreachable at {self.base_url}. Using local memory store.",
        }

    async def retain(
        self,
        title: str,
        content: str,
        category: str = "preference",
        tags: Optional[List[str]] = None,
        bank_id: str = DEFAULT_BANK_ID,
    ) -> Dict[str, Any]:
        """
        Store a new memory using Hindsight retain endpoint:
        POST /v1/default/banks/{bank_id}/memories
        """
        tags = tags or []
        health = await self.check_health()
        synced = False
        memory_id = f"mem-{int(datetime.utcnow().timestamp())}"

        if health["connected"]:
            try:
                payload = {
                    "content": f"[{category.upper()}] {title}: {content}",
                    "metadata": {
                        "id": memory_id,
                        "title": title,
                        "category": category,
                        "tags": tags,
                        "created_at": datetime.utcnow().isoformat(),
                    },
                }
                async with httpx.AsyncClient(timeout=5.0) as client:
                    res = await client.post(
                        f"{self.base_url}/v1/default/banks/{bank_id}/memories",
                        json=payload,
                        headers=self._get_headers(),
                    )
                    if res.is_success:
                        synced = True
            except Exception as e:
                print(f"[Hindsight] Remote retain error: {e}")

        new_item = {
            "id": memory_id,
            "bank_id": bank_id,
            "title": title,
            "content": content,
            "category": category,
            "tags": tags,
            "created_at": datetime.utcnow().isoformat(),
            "synced_to_hindsight": synced,
        }
        self.fallback_memories.insert(0, new_item)
        return new_item

    async def recall(
        self,
        query: str,
        bank_id: str = DEFAULT_BANK_ID,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """
        Retrieve relevant memories using Hindsight recall endpoint:
        POST /v1/default/banks/{bank_id}/recall
        """
        health = await self.check_health()

        if health["connected"]:
            try:
                payload = {"query": query, "limit": limit}
                async with httpx.AsyncClient(timeout=5.0) as client:
                    res = await client.post(
                        f"{self.base_url}/v1/default/banks/{bank_id}/recall",
                        json=payload,
                        headers=self._get_headers(),
                    )
                    if res.is_success:
                        data = res.json()
                        raw_memories = data.get("memories", [])
                        return {
                            "memories": raw_memories,
                            "hindsight_connected": True,
                            "source": "hindsight-live",
                        }
            except Exception as e:
                print(f"[Hindsight] Remote recall error: {e}")

        # Local fallback keyword scoring
        keywords = set(query.lower().split())
        scored = []
        for mem in self.fallback_memories:
            text = f"{mem['title']} {mem['content']}".lower()
            score = 0.5 + sum(0.1 for kw in keywords if kw in text)
            scored.append({**mem, "relevance_score": min(0.99, round(score, 2))})

        scored.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return {
            "memories": scored[:limit],
            "hindsight_connected": False,
            "source": "local-standby",
        }
