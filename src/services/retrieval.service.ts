import { prisma } from "../lib/prisma";
import { getEmbedding } from "../lib/embedder";
interface RetrievalParams {
    repositoryId: string;
    question: string;
    limit?: number;
}
interface RetrievedChunk {
    filePath: string;
    startLine: number;
    endLine: number;
    content: string;
    distance: number;
}
class RetrievalService {
    async retrieveRelevantChunks(params: RetrievalParams): Promise<RetrievedChunk[]> {
        const { repositoryId, question, limit = 6 } = params;
        const questionEmbedding = await getEmbedding(question);

        const chunks = await prisma.$queryRaw<
            Array<{
                id: string;
                fileId: string;
                startLine: number;
                endLine: number;
                content: string;
                filePath: string;
                distance: number;
            }>
        >`
            SELECT
                fc.id,
                fc."fileId",
                fc."startLine",
                fc."endLine",
                fc.content,
                f."filePath",
                (fc.embedding <=> ${JSON.stringify(questionEmbedding)}::vector) AS distance
            FROM "FileChunk" fc
            INNER JOIN "File" f ON fc."fileId" = f.id
            WHERE f."repositoryId" = ${repositoryId}
            ORDER BY fc.embedding <=> ${JSON.stringify(questionEmbedding)}::vector
            LIMIT ${limit}
        `;

        if (chunks.length === 0) {
            throw new Error("No relevant chunks found for the given question");
        }

        return chunks.map((chunk) => ({
            filePath: chunk.filePath,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            content: chunk.content,
            distance: chunk.distance,
        }));
    }
}
export const retrievalService = new RetrievalService();
