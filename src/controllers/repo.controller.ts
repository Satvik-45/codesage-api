import { Request, Response, NextFunction } from "express";
import { repoService } from "../services/repo.service";
import { prisma } from "../lib/prisma";
export async function uploadRepo(req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        const repositoryId = await repoService.handleZipUpload(req.file);
        res.json({
            success: true,
            repositoryId,
        });
    } catch (error) {
        next(error);
    }
}
export async function connectGithubRepo(req: Request, res: Response, next: NextFunction) {
    try {
        const { githubUrl } = req.body;
        if (!githubUrl) {
            return res.status(400).json({
                success: false,
                message: "githubUrl is required",
            });
        }
        const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
        if (!githubRegex.test(githubUrl)) {
            return res.status(400).json({
                success: false,
                message: "Invalid GitHub URL format. Expected: https://github.com/{owner}/{repo}",
            });
        }
        const repositoryId = await repoService.handleGithubRepo(githubUrl);
        res.json({
            success: true,
            repositoryId,
        });
    } catch (error) {
        next(error);
    }
}

export async function listRepositories(req: Request, res: Response, next: NextFunction) {
    try {
        const repositories = await repoService.listRepositories();
        res.json({
            success: true,
            repositories,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteRepository(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { repositoryId } = req.params;

        if (!repositoryId || typeof repositoryId !== "string") {
            return res.status(400).json({
                success: false,
                message: "repositoryId is required",
            });
        }

        await prisma.repository.delete({
            where: { id: repositoryId },
        });

        res.json({
            success: true,
            message: "Repository deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}
