import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export type InitQuizPayload = { title: string; description: string };

export type GenerateQuizPayload = { title: string; description: string };

export type UpdateQuizPayload = {
  title: string;
  description: string;
  questions: {
    id: string;
    title: string;
    options: { id: string; title: string }[];
    correctOption: string;
  }[];
};

export type QuizComplete = Awaited<ReturnType<QuizzesService["findById"]>>;

export class QuizzesService {
  async findMany() {
    return prisma.quiz.findMany();
  }

  async findById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: { questions: { include: { options: true } } },
    });
  }

  async init(payload: InitQuizPayload) {
    return prisma.quiz.create({
      data: { title: payload.title, description: payload.description },
    });
  }

  async update(id: string, payload: UpdateQuizPayload) {
    const quiz = await prisma.$transaction(async (tx) => {
      // Update quiz
      await tx.quiz.update({
        where: { id },
        data: { title: payload.title, description: payload.description },
      });

      // For each question, update or create it
      for (const question of payload.questions) {
        // Update or create question
        await tx.question.upsert({
          where: { id: question.id },
          create: { id: question.id, title: question.title, quizId: id },
          update: { title: question.title },
        });

        // For each option, update or create it
        for (const option of question.options) {
          const isCorrect = option.id === question.correctOption;

          // Update or create option
          await tx.option.upsert({
            where: { id: option.id },
            create: {
              id: option.id,
              questionId: question.id,
              title: option.title,
              isCorrect,
            },
            update: { title: option.title, isCorrect },
          });
        }
      }
    });

    return quiz;
  }

  async delete(id: string) {
    return prisma.quiz.delete({ where: { id } });
  }

  async generate(payload: GenerateQuizPayload) {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      prompt: `Com base no título: "${payload.title}" e descrição: "${payload.description}", crie um quiz com 15 perguntas e 4 opções de resposta cada.`,
      schema: z.object({
        questions: z.array(
          z.object({
            title: z.string(),
            options: z.array(z.object({ key: z.string(), title: z.string() })),
            correctOption: z.string(),
          })
        ),
      }),
    });

    return object;
  }

  async getRanking(quizId: string) {
    return prisma.result.findMany({
      where: { quizId },
      orderBy: { score: "desc" },
    });
  }

  async startQuiz(quizId: string, name: string) {
    return prisma.result.create({
      data: {
        quizId,
        name,
        score: 0,
      },
    });
  }

  async getResult(resultId: string) {
    return prisma.result.findUnique({ where: { id: resultId } });
  }

  async saveResult(resultId: string, score: number) {
    return prisma.result.update({ where: { id: resultId }, data: { score } });
  }
}
