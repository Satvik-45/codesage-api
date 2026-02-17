# CodeSage API

CodeSage API is the backend service powering the CodeSage platform — a Retrieval-Augmented Generation (RAG) system for semantic codebase analysis.

It ingests repositories (ZIP or GitHub), performs chunking and embedding, stores vector representations in PostgreSQL (pgvector), retrieves relevant code context via similarity search, and generates grounded answers using Groq LLM.

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

## 🏗 Tech Stack

### Embeddings
- `Xenova/all-MiniLM-L6-v2`
- 384-dimensional vectors
- Local inference via `@xenova/transformers`

### LLM
- Groq API
- Model: `llama-3.1-8b-instant`


### Embeddings
- `Xenova/all-MiniLM-L6-v2`
- 384-dimensional vectors
- Local inference via `@xenova/transformers`

### LLM
- Groq API
- Model: `llama-3.1-8b-instant`

### Code Chunking
Each file is:
- Split into logical line-based chunks
- Stored with:
  - filePath
  - startLine
  - endLine
  - content
  - embedding (vector)

### Embedding Pipeline
- Uses MiniLM locally
- Mean pooling + normalization
- Stored as `vector(384)` in PostgreSQL
- No external embedding API dependency

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

### Why Local Embeddings?
No API cost
Fully self-contained
Assessment-friendly
Avoids OpenAI credit exhaustion

### Why Groq?
Fast inference
Stable free tier
Reliable for evaluation testing

