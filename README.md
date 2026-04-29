#  Qwen AI Chat

> A  business intelligence chat interface powered by **Qwen3-VL-32B** running on AWS.  
> Upload Excel / CSV files and get instant AI analysis, insights, and interactive HTML dashboards.

---


## Getting Started

### Prerequisites

- Node.js 24+
- Qwen vLLM server running 

---

### 1 — Backend

```bash
cd backend
npm install
npm run dev
# Listening on http://localhost:4000
```

---

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# Listening on http://localhost:3000
```

Configure `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Features

- **Streaming chat** — real-time token-by-token responses via SSE
- **File analysis** — upload `.xlsx`, `.xls`, `.csv`, or `.tsv` files
- **HTML report generation** — AI generates a full interactive dashboard
- **Light / Dark mode** — toggle in the sidebar, persisted to localStorage
- **Multi-sheet support** — all sheets parsed and injected as context

---

## How to Use

### Chat

1. Open [http://localhost:3000](http://localhost:3000)
2. *(Optional)* Edit the **system prompt** in the sidebar
3. *(Optional)* Upload a data file via the sidebar drag-drop zone
4. Type your question and press **Enter**

### Generate a Report

1. Upload your data file
2. Click **📊** next to the send button (or type *"Generate an interactive dashboard"*)
3. Click **View Report** on the response to open it fullscreen
4. Click **Download .html** to save

---

## API Reference

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload Excel/CSV — returns `fileId` + parsed metadata |
| `DELETE` | `/api/upload/:fileId` | Delete an uploaded file |
| `POST` | `/api/chat` | Chat with Qwen — supports SSE streaming |
| `GET` | `/api/health` | Check backend + Qwen connectivity |

### POST /api/chat

```json
{
  "messages": [{ "role": "user", "content": "Summarize this data" }],
  "systemPrompt": "You are a business analyst.",
  "fileId": "upload-1234567890.xlsx",
  "generateReport": false,
  "stream": true
}
```

### GET /api/health — Response

```json
{
  "status": "ok",
  "model": "Qwen/Qwen3-VL-32B-Instruct",
  "endpoint": "http://13.50.155.234:5001/v1",
  "timestamp": "2026-04-29T10:00:00.000Z"
}
```

---

## Production

```bash
# Backend — no build step needed (plain JS)
cd backend && npm start

# Frontend — build then start
cd frontend && npm run build && npm start
```
