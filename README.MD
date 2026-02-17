# CodeSage API

CodeSage API is the backend service powering the CodeSage platform — a Retrieval-Augmented Generation (RAG) system for semantic codebase analysis.

It ingests repositories (ZIP or GitHub), performs chunking and embedding, stores vector representations in PostgreSQL (pgvector), retrieves relevant code context via similarity search, and generates grounded answers using Groq LLM.

---
## Live Link
https://codesage-liard.vercel.app/new

## 🚀 System Overview

Repository Upload → Chunking → Embedding → Vector Storage → Similarity Search → LLM → Structured References

### Flow

1. Repository uploaded (ZIP) or connected via GitHub
2. Files parsed and split into logical chunks
3. Embeddings generated locally (MiniLM)
4. Stored in PostgreSQL using pgvector (384 dimensions)
5. User question embedded
6. Similar chunks retrieved using vector similarity
7. Context passed to Groq LLM with strict grounding rules
8. Natural language answer generated
9. Structured references returned (filePath + startLine + endLine + snippet)
10. Question + references persisted in database

---

## 🏗 Tech Stack

### Runtime
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL (Neon)
- Prisma ORM
- pgvector extension

### Embeddings
- `Xenova/all-MiniLM-L6-v2`
- 384-dimensional vectors
- Local inference via `@xenova/transformers`

### LLM
- Groq API
- Model: `llama-3.1-8b-instant`

### File Handling
- Multer (ZIP uploads)
- GitHub repository cloning

---

## 📂 Project Structure
src/
├── controllers/
├── services/
│ ├── repo.service.ts
│ ├── qa.service.ts
│ ├── embedding.service.ts
│ └── retrieval.service.ts
├── lib/
│ ├── prisma.ts
│ ├── embedder.ts
│ └── groq.ts
├── routes/
└── config/


---

## 🔎 Core Functionalities

### Repository Management
- Upload ZIP repository
- Connect GitHub repository
- List repositories
- Delete repository (cascade delete)
- Clear repository chat history
- Delete individual chat

---

### Code Chunking
Each file is:
- Split into logical line-based chunks
- Stored with:
  - filePath
  - startLine
  - endLine
  - content
  - embedding (vector)

---

### Embedding Pipeline

- Uses MiniLM locally
- Mean pooling + normalization
- Stored as `vector(384)` in PostgreSQL
- No external embedding API dependency

---

### Retrieval System

Similarity search using pgvector:
```sql
ORDER BY embedding <=> question_vector
LIMIT k
```
Returns only relevant chunks.

### LLM Grounded Answer Generation

Strict rules enforced:
Must use ONLY retrieved context
No hallucination
No code blocks in answer
No line numbers in answer
If not found:
"The answer is not found in the provided code."

Code snippets are returned ONLY in references, never inside answer.

### References System

Each response returns:

{
  "filePath": "dashboard/page.tsx",
  "startLine": 64,
  "endLine": 79,
  "snippet": "const features = [...]"
}


Frontend renders snippets separately.

### 🌐 API Endpoints

Repository
POST /repo/upload
POST /repo/github
GET /repo/list
DELETE /repo/:repositoryId

QA
POST /qa/ask
GET /qa/history/:repositoryId
DELETE /qa/history/:repositoryId
DELETE /qa/:chatId

System
GET /health

Returns:
{
  "backend": "ok",
  "database": "ok"
}

### 🔐 Environment Variables
PORT=
DATABASE_URL=
GROQ_API_KEY=

### ⚙️ Local Setup
npm install
npx prisma migrate deploy
npm run build
npm start

### 🚀 Deployment

Hosted on Render
PostgreSQL hosted on Neon
Production-ready environment variable configuration

Web concurrency configured automatically

### 🧠 Design Decisions

Why Local Embeddings?
No API cost
Fully self-contained
Assessment-friendly
Avoids OpenAI credit exhaustion

Why Groq?
Fast inference
Stable free tier
Reliable for evaluation testing 

Why pgvector?
Native PostgreSQL extension
Efficient similarity search
Scalable vector indexing

### 📈 Future Improvements
Hybrid keyword + vector search
Streaming responses
Semantic caching
Code graph indexing
Advanced chunk overlap strategy

### 👨‍💻 Author

Built as part of a technical assessment demonstrating:
RAG implementation
Vector similarity search
LLM grounding
Clean backend architecture
Production deployment