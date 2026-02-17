import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function healthCheck(req: Request, res: Response) {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            backend: "ok",
            database: "ok",
        });
    } catch (error) {
        res.status(500).json({
            backend: "ok",
            database: "error",
        });
    }
}
