"use client";

import { eden } from "@/lib/eden/client";
import { QuizComplete, UpdateQuizPayload } from "@/server/quizzes/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";
import { DefaultValues, UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface QuizFormContextType {
  form: UseFormReturn<CreateQuizForm>;
  isGenerating: boolean;
  isSubmitting: boolean;
  questionId(index: number): string;
  optionId(index: number): string;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleGenerate(): Promise<void>;
}

interface QuizFormContextProps {
  children: React.ReactNode;
  quiz: NonNullable<QuizComplete>;
}

export const MAX_OPTIONS = 4 as const;

const QuizFormContext = createContext({} as QuizFormContextType);

export const useQuizForm = () => useContext(QuizFormContext);

const CreateQuizSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  description: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres"),
  questions: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(3, "O título da pergunta deve ter no mínimo 3 caracteres"),
      correctOption: z.coerce.string(),
      options: z.array(
        z.object({
          id: z.string(),
          title: z.string().min(3, "O título da opção deve ter no mínimo 3 caracteres"),
        })
      ),
    })
  ),
});

type CreateQuizForm = z.infer<typeof CreateQuizSchema>;

function createDefaultValues(quiz: NonNullable<QuizComplete>): DefaultValues<CreateQuizForm> {
  return {
    title: quiz.title,
    description: quiz.description ?? "",
    questions: quiz.questions.map((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);

      return {
        id: question.id,
        title: question.title,
        correctOption: correctOption?.id,
        options: question.options.map((option) => ({
          id: option.id,
          title: option.title,
        })),
      };
    }),
  };
}

export function QuizFormContextProvider({ children, quiz }: QuizFormContextProps) {
  const form = useForm<CreateQuizForm>({
    defaultValues: createDefaultValues(quiz),
    resolver: zodResolver(CreateQuizSchema),
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => eden.api.quizzes.generate.post(data),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateQuizPayload) => eden.api.quizzes({ id: id }).put(data),
  });

  const handleSubmit = form.handleSubmit((data) => {
    const { title, description, questions } = data;

    const payload: UpdateQuizPayload = {
      title,
      description,
      questions: questions.map(({ id, title, correctOption, options }) => ({
        id,
        title,
        options: options.map(({ id, title }) => ({ id, title })),
        correctOption,
      })),
    };

    console.log(`[Payload]`, payload);

    updateMutation.mutate(
      { id: quiz.id, ...payload },
      {
        onError(error) {
          console.log(`[Error]`, error);
          toast.error(`Erro: ${error}`);
        },
        onSuccess({ error }) {
          if (error) {
            console.log(`[Error]`, error);
            toast.error(`Erro: ${error}`);
            return;
          }

          toast.success("Quiz atualizado com sucesso!");
        },
      }
    );
  });

  async function handleGenerate() {
    const title = form.getValues("title");
    const description = form.getValues("description");

    const data = { title, description };

    generateMutation.mutate(data, {
      onError(error) {
        console.log(`[Error]`, error);
        toast.error(`Erro: ${error}`);
      },
      onSuccess({ data, error }) {
        if (error) {
          console.log(`[Error]`, error);
          toast.error(`Erro: ${error}`);
          return;
        }

        const questions = data.questions.map((question) => {
          const questionId = createId();
          const options = question.options.map((option) => ({ id: createId(), ...option }));
          const correctOption = options.find((option) => option.key === question.correctOption);

          return {
            id: questionId,
            title: question.title,
            correctOption: correctOption?.id ?? options[0].id,
            options,
          };
        });

        console.log(`[Questions]`, questions);

        form.setValue("questions", questions);
      },
    });
  }

  const questionId = (index: number) => `question-${index}`;
  const optionId = (index: number) => `option-${index}`;

  return (
    <QuizFormContext.Provider
      value={{
        form,
        handleSubmit,
        handleGenerate,
        questionId,
        optionId,
        isSubmitting: updateMutation.isPending,
        isGenerating: generateMutation.isPending,
      }}
    >
      {children}
    </QuizFormContext.Provider>
  );
}
