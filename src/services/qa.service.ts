import { prisma } from "../lib/prisma";
import { retrievalService } from "./retrieval.service";
import { groq } from "../lib/groq";
interface AskQuestionParams {
    repositoryId: string;
    question: string;
}
interface Reference {
    filePath: string;
    startLine: number;
    endLine: number;
    snippet: string;
}
interface AskQuestionResponse {
    answer: string;
    references: Reference[];
}
class QAService {
    async askQuestion(params: AskQuestionParams): Promise<AskQuestionResponse> {
        const { repositoryId, question } = params;
        const retrievedChunks = await retrievalService.retrieveRelevantChunks({
            repositoryId,
            question,
            limit: 6,
        });

        // Implement proper semantic filtering using vector distance
        const MAX_DISTANCE = 0.6; // Distance threshold for relevance

        const relevantChunks = retrievedChunks
            .filter(chunk => chunk.distance < MAX_DISTANCE)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 2);

        // Fallback: if no chunk passes threshold, use top 1 most similar
        const finalChunks = relevantChunks.length > 0 ? relevantChunks : [retrievedChunks[0]];
        const context = finalChunks
            .map((chunk) => {
                return `File: ${chunk.filePath} (lines ${chunk.startLine}-${chunk.endLine})\n${chunk.content}`;
            })
            .join("\n\n");
        const prompt = `You are a codebase analysis assistant.

STRICT RULES:
- The answer must contain ONLY a natural language explanation.
- DO NOT include any code snippets.
- DO NOT include triple backticks.
- DO NOT include inline code.
- DO NOT mention line numbers.
- If code is relevant, describe it in words only.
- The frontend will render code from references separately.

Use ONLY the provided context.

If the answer is not found, respond exactly: "The answer is not found in the provided code."

Context:
${context}

Question: ${question}

Answer:`;
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a codebase analysis assistant. Use only the provided context.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        const generatedAnswer = completion.choices[0]?.message?.content || "No answer generated.";
        const savedQuestion = await prisma.question.create({
            data: {
                repositoryId,
                questionText: question,
                answerText: generatedAnswer,
            },
        });
        for (const chunk of finalChunks) {
            const fileChunk = await prisma.fileChunk.findFirst({
                where: {
                    file: {
                        repositoryId,
                        filePath: chunk.filePath,
                    },
                    startLine: chunk.startLine,
                    endLine: chunk.endLine,
                },
            });
            if (fileChunk) {
                await prisma.reference.create({
                    data: {
                        questionId: savedQuestion.id,
                        fileChunkId: fileChunk.id,
                    },
                });
            }
        }
        return {
            answer: generatedAnswer,
            references: finalChunks.map((chunk) => ({
                filePath: chunk.filePath,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
                snippet: chunk.content.trim(),
            })),
        };
    }
    async getRecentQuestions(repositoryId: string) {
        const questions = await prisma.question.findMany({
            where: { repositoryId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                references: {
                    include: {
                        fileChunk: {
                            include: {
                                file: true,
                            },
                        },
                    },
                },
            },
        });
        return questions.map((q) => ({
            id: q.id,
            question: q.questionText,
            answer: q.answerText,
            createdAt: q.createdAt,
            references: q.references.map((ref) => ({
                filePath: ref.fileChunk.file.filePath,
                startLine: ref.fileChunk.startLine,
                endLine: ref.fileChunk.endLine,
                snippet: ref.fileChunk.content,
            })),
        }));
    }
}
export const qaService = new QAService();
