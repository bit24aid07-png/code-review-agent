# CodeMind AI – Memory-Powered Code Review Agent

> **A modern, full-stack AI Code Reviewer that remembers developer preferences, team standards, and architectural decisions using Hindsight long-term memory & Google Gemini.**

---

## 🌟 What Makes CodeMind AI Different?

Standard AI code review tools treat every review in isolation: they have amnesia. They don't know that:
- Your team insists on strict **PEP 484 type annotations**.
- You prefer **list comprehensions** over nested loops.
- Your database access layer requires **SQLAlchemy parameterization** to avoid injection.
- You previously agreed on a specific **FastAPI domain-service architecture**.

**CodeMind AI solves this with Hindsight Long-Term Memory:**
1. **Retain**: Extracted coding preferences, team standards, and feedback patterns are stored in a dedicated Hindsight memory bank.
2. **Recall**: Before analyzing your code, the agent searches Hindsight for contextually relevant rules and preferences.
3. **Personalized Review**: Google Gemini applies these memories, catching violations that generic linters overlook.
4. **Learn**: Useful confirmed habits and architectural patterns from each review can be retained back into Hindsight with one click.

---

## 🏗️ Architecture Overview

```text
 ┌────────────────────────────────────────────────────────┐
 │                   React + Vite SPA                     │
 │      Monaco Editor, Visual Diff, Memory Inspector      │
 └──────────────────────────┬─────────────────────────────┘
                            │ REST API (/api/*)
 ┌──────────────────────────▼─────────────────────────────┐
 │           Full-Stack Backend (Express & FastAPI)       │
 │   - server.ts: Integrated Node.js full-stack server    │
 │   - backend/ : Dedicated Python FastAPI backend        │
 └─────────────┬───────────────────────────┬──────────────┘
               │                           │
  Recall & Retain API                 Code + Memory Context
               │                           │
 ┌─────────────▼─────────────┐ ┌───────────▼──────────────┐
 │      Hindsight Engine     │ │     Google Gemini AI     │
 │  Biomimetic Memory Bank   │ │    gemini-3.8-flash      │
 │   (retain / recall)       │ │  Deep Code AST Analysis  │
 └───────────────────────────┘ └──────────────────────────┘
```

---

## 🚀 Running Locally

### Option 1: Quickstart (Integrated Full-Stack Server)

The app comes configured with a Node/Express server that runs both the frontend and backend together:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY`.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Running with Python FastAPI Backend

If you want to run the dedicated Python FastAPI backend:

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your environment variables**:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   export HINDSIGHT_API_URL="http://localhost:8888"
   ```

5. **Start FastAPI**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   FastAPI will be available at [http://localhost:8000](http://localhost:8000) with interactive Swagger docs at `/docs`.

---

## 🧠 Connecting Real Hindsight (Docker)

To connect the official Hindsight memory engine:

```bash
docker run -d -p 8888:8888 vectorize/hindsight
```

Once running:
- Hindsight listens at `http://localhost:8888`.
- CodeMind AI will automatically detect the connection and switch its status badge from `[Local Standby]` to `[Hindsight Live Active]`.
- No mock data or pretending: the status indicator displays real-time health pings!

---

## 🔑 Required Credentials

| Environment Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key for running code analysis. (Configured in AI Studio Secrets) |
| `HINDSIGHT_API_URL` | Optional | URL of Hindsight instance (defaults to `http://localhost:8888`). |
| `HINDSIGHT_API_KEY` | Optional | API key if connecting to a protected remote Hindsight cluster. |
| `HINDSIGHT_BANK_ID` | Optional | Namespace/Bank ID for developer memories (default: `codemind-developer`). |
