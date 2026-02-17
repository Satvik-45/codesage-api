import AdmZip from "adm-zip";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { isValidCodeFile, shouldIgnoreDirectory, getLanguageFromExtension } from "../utils/file-filter";
import { chunkService } from "./chunk.service";
import { embeddingService } from "./embedding.service";
class RepoService {
    async handleZipUpload(file: Express.Multer.File): Promise<string> {
        const extractPath = path.join("./tmp", uuidv4());
        try {
            const zip = new AdmZip(file.path);
            zip.extractAllTo(extractPath, true);
            const repository = await prisma.repository.create({
                data: {
                    name: file.originalname,
                    sourceType: "ZIP",
                },
            });
            await this.processDirectory(extractPath, repository.id, extractPath);

            // Only generate embeddings if none exist yet
            const existingChunks = await prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::int as count
                FROM "FileChunk" fc
                INNER JOIN "File" f ON fc."fileId" = f.id
                WHERE f."repositoryId" = ${repository.id}
                AND fc.embedding IS NOT NULL
            `;
            const count = Number(existingChunks[0].count);

            if (count === 0) {
                await embeddingService.generateEmbeddingsForRepository(repository.id);
            }

            return repository.id;
        } finally {
            if (fs.existsSync(extractPath)) {
                fs.rmSync(extractPath, { recursive: true, force: true });
            }
            if (fs.existsSync(file.path)) {
                fs.rmSync(file.path, { force: true });
            }
        }
    }
    async handleGithubRepo(githubUrl: string): Promise<string> {
        const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
        if (!githubRegex.test(githubUrl)) {
            throw new Error("Invalid GitHub URL format");
        }
        const clonePath = path.join("./tmp", uuidv4());
        try {
            const git = simpleGit();
            await git.clone(githubUrl, clonePath, ["--depth", "1"]);
            const repoName = githubUrl.split("/").pop() || "unknown";
            const repository = await prisma.repository.create({
                data: {
                    name: repoName,
                    sourceType: "GITHUB",
                    githubUrl,
                },
            });
            await this.processDirectory(clonePath, repository.id, clonePath);

            // Only generate embeddings if none exist yet
            const existingChunks = await prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::int as count
                FROM "FileChunk" fc
                INNER JOIN "File" f ON fc."fileId" = f.id
                WHERE f."repositoryId" = ${repository.id}
                AND fc.embedding IS NOT NULL
            `;
            const count = Number(existingChunks[0].count);

            if (count === 0) {
                await embeddingService.generateEmbeddingsForRepository(repository.id);
            }

            return repository.id;
        } finally {
            if (fs.existsSync(clonePath)) {
                fs.rmSync(clonePath, { recursive: true, force: true });
            }
        }
    }
    private async processDirectory(dirPath: string, repositoryId: string, basePath: string): Promise<void> {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                if (shouldIgnoreDirectory(entry.name)) {
                    continue;
                }
                await this.processDirectory(fullPath, repositoryId, basePath);
            } else if (entry.isFile()) {
                if (isValidCodeFile(entry.name)) {
                    const relativePath = path.relative(basePath, fullPath);
                    const ext = path.extname(entry.name);
                    const language = getLanguageFromExtension(ext);
                    const stats = fs.statSync(fullPath);
                    const createdFile = await prisma.file.create({
                        data: {
                            repositoryId,
                            filePath: relativePath,
                            language,
                            size: stats.size,
                        },
                    });
                    await chunkService.createChunksForFile({
                        fileId: createdFile.id,
                        filePath: fullPath,
                    });
                }
            }
        }
    }

    async listRepositories() {
        return await prisma.repository.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { files: true },
                },
            },
        });
    }
}
export const repoService = new RepoService();
