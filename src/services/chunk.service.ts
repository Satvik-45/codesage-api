import fs from "fs";
import { prisma } from "../lib/prisma";
interface CreateChunksParams {
    fileId: string;
    filePath: string;
}
class ChunkService {
    private readonly CHUNK_SIZE = 40;
    async createChunksForFile(params: CreateChunksParams): Promise<void> {
        const { fileId, filePath } = params;
        console.log(`Chunking file: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const lines = fileContent.split("\n");
        for (let i = 0; i < lines.length; i += this.CHUNK_SIZE) {
            const chunkLines = lines.slice(i, i + this.CHUNK_SIZE);
            const startLine = i + 1;
            const endLine = i + chunkLines.length;
            const content = chunkLines.join("\n");
            await prisma.fileChunk.create({
                data: {
                    fileId,
                    startLine,
                    endLine,
                    content,
                },
            });
        }
    }
}
export const chunkService = new ChunkService();
