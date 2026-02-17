import { prisma } from "../lib/prisma";
import { getEmbedding } from "../lib/embedder";
class EmbeddingService {
    async generateEmbeddingsForRepository(repositoryId: string): Promise<void> {
        const chunks = await prisma.$queryRaw<
            Array<{ id: string; content: string }>
        >`
      SELECT fc.id, fc.content
      FROM "FileChunk" fc
      INNER JOIN "File" f ON fc."fileId" = f.id
      WHERE f."repositoryId" = ${repositoryId}
      AND fc.embedding IS NULL
    `;
        console.log(`Found ${chunks.length} chunks to embed for repository ${repositoryId}`);
        for (const chunk of chunks) {
            console.log(`Embedding chunk ${chunk.id}`);
            try {
                const embeddingArray = await getEmbedding(chunk.content);

                await prisma.$executeRaw`
          UPDATE "FileChunk"
          SET embedding = ${JSON.stringify(embeddingArray)}::vector
          WHERE id = ${chunk.id}
        `;
            } catch (error) {
                console.error(`Failed to embed chunk ${chunk.id}:`, error);
                throw error;
            }
        }
        console.log(`Successfully embedded ${chunks.length} chunks`);
    }
}
export const embeddingService = new EmbeddingService();
