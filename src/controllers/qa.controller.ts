import { Request, Response, NextFunction } from "express";
import { qaService } from "../services/qa.service";
import { prisma } from "../lib/prisma";
export async function askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
        const { repositoryId, question } = req.body;
        if (!repositoryId) {
            return res.status(400).json({
                success: false,
                message: "repositoryId is required",
            });
        }
        if (!question) {
            return res.status(400).json({
                success: false,
                message: "question is required",
            });
        }
        const result = await qaService.askQuestion({ repositoryId, question });
        res.json(result);
    } catch (error) {
        next(error);
    }
}
export async function getRecentQuestions(
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
        const result = await qaService.getRecentQuestions(repositoryId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function clearRepositoryHistory(
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

        await prisma.question.deleteMany({
            where: { repositoryId },
        });

        res.json({
            success: true,
            message: "Chat history cleared",
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteSingleQuestion(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { questionId } = req.params;

        if (!questionId || typeof questionId !== "string") {
            return res.status(400).json({
                success: false,
                message: "questionId is required",
            });
        }

        await prisma.question.delete({
            where: { id: questionId },
        });

        res.json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        next(error);
    }
}
