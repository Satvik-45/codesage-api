import { Router } from "express";
import { askQuestion, getRecentQuestions, clearRepositoryHistory, deleteSingleQuestion } from "../controllers/qa.controller";
const router = Router();
router.post("/ask", askQuestion);
router.get("/history/:repositoryId", getRecentQuestions);
router.delete("/history/:repositoryId", clearRepositoryHistory);
router.delete("/:questionId", deleteSingleQuestion);
export default router;
