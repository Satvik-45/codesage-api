-- CreateIndex
-- Add IVFFlat index for vector similarity search performance
CREATE INDEX IF NOT EXISTS "filechunk_embedding_idx" ON "FileChunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
