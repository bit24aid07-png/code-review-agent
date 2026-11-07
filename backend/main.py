"""
FastAPI Server for CodeMind AI
Provides REST endpoints for code analysis, Hindsight memory retain/recall, and review history.
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from hindsight_client import HindsightClient
from gemini_reviewer import GeminiCodeReviewer

load_dotenv()

app = FastAPI(
    title="CodeMind AI – FastAPI Backend",
    description="Intelligent code review agent with Gemini and Hindsight long-term memory",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hindsight = HindsightClient()
reviewer = GeminiCodeReviewer()

# Models
class ReviewRequest(BaseModel):
    projectName: str = "Python Project"
    language: str = "Python"
    code: str
    instructions: Optional[str] = ""
    useMemory: bool = True
    bankId: Optional[str] = "codemind-developer"

class RetainRequest(BaseModel):
    title: str
    content: str
    category: str = "preference"
    tags: List[str] = []
    bankId: Optional[str] = "codemind-developer"

class RecallRequest(BaseModel):
    query: str
    bankId: Optional[str] = "codemind-developer"
    limit: int = 5


@app.get("/")
def read_root():
    return {"status": "ok", "app": "CodeMind AI FastAPI Backend"}

@app.get("/api/status")
async def get_status():
    h_status = await hindsight.check_health()
    return {
        "geminiReady": bool(os.getenv("GEMINI_API_KEY")),
        "hindsight": h_status,
        "mode": "FastAPI",
    }

@app.post("/api/review")
async def run_review(req: ReviewRequest):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    # 1. Recall memory
    recalled = []
    if req.useMemory:
        recall_res = await hindsight.recall(query=req.code[:1500], bank_id=req.bankId)
        recalled = recall_res.get("memories", [])

    # 2. Run Gemini review
    try:
        result = await reviewer.review_code(
            project_name=req.projectName,
            language=req.language,
            code=req.code,
            instructions=req.instructions or "",
            recalled_memories=recalled,
            use_memory=req.useMemory,
        )
        result["recalledMemories"] = recalled
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/retain")
async def retain_memory_endpoint(req: RetainRequest):
    item = await hindsight.retain(
        title=req.title,
        content=req.content,
        category=req.category,
        tags=req.tags,
        bank_id=req.bankId,
    )
    return item

@app.post("/api/memory/recall")
async def recall_memory_endpoint(req: RecallRequest):
    return await hindsight.recall(query=req.query, bank_id=req.bankId, limit=req.limit)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
