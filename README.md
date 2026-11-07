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

## 🧠 Hindsight Memory Integration

CodeMind AI is designed to use Hindsight as its long-term memory engine.

The memory workflow includes:

- **Retain:** Store developer preferences, coding standards, and confirmed feedback.
- **Recall:** Retrieve relevant memories before reviewing new code.
- **Personalize:** Use recalled context to make code reviews more relevant to developer preferences.

### Current Status

CodeMind AI currently supports a local standby memory store when the Hindsight server is unavailable.

To enable the live Hindsight integration, the Hindsight server must be running and accessible at the configured endpoint.

Default endpoint:

```text
http://localhost:8888
```

To run Hindsight using Docker:

```bash
docker run -d -p 8888:8888 vectorize/hindsight
```

**Note:** Live Hindsight connectivity has not yet been verified in this development setup. The application can use its local standby memory mode in the meantime.
