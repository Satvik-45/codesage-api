ALTER TABLE "FileChunk" DROP COLUMN embedding;
ALTER TABLE "FileChunk" ADD COLUMN embedding vector(384);