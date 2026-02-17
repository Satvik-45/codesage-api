import { Router } from "express";
import { uploadZip } from "../middlewares/upload.middleware";
import { uploadRepo, connectGithubRepo, listRepositories, deleteRepository } from "../controllers/repo.controller";
const router = Router();
router.get("/list", listRepositories);
router.post("/upload", uploadZip, uploadRepo);
router.post("/github", connectGithubRepo);
router.delete("/:repositoryId", deleteRepository);
export default router;
