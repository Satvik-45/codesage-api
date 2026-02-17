import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import healthRoutes from "./routes/health.routes";
import repoRoutes from "./routes/repo.routes";
import qaRoutes from "./routes/qa.routes";
const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/health", healthRoutes);
app.use("/repo", repoRoutes);
app.use("/qa", qaRoutes);
app.use(errorHandler);
app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
});
