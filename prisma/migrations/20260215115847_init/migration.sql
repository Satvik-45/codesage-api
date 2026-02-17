CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "language" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FileChunk" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "startLine" INTEGER NOT NULL,
    "endLine" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileChunk_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "fileChunkId" TEXT NOT NULL,
    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "File" ADD CONSTRAINT "File_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileChunk" ADD CONSTRAINT "FileChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_fileChunkId_fkey" FOREIGN KEY ("fileChunkId") REFERENCES "FileChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
