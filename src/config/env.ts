import dotenv from "dotenv";
dotenv.config();
function getEnv(name: string, required = true): string {
    const value = process.env[name];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || "";
}
export const env = {
    PORT: getEnv("PORT", false) || "5000",
    DATABASE_URL: getEnv("DATABASE_URL"),
    OPENAI_API_KEY: getEnv("OPENAI_API_KEY", false),
    EMBEDDING_MODEL: getEnv("EMBEDDING_MODEL", false) || "text-embedding-3-small",
    LLM_MODEL: getEnv("LLM_MODEL", false) || "gpt-4o-mini",
    GROQ_API_KEY: getEnv("GROQ_API_KEY"),
};
