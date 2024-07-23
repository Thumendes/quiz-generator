"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eden } from "@/lib/eden/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface StartQuizFormProps {
  quizId: string;
}

const StartQuizFormSchema = z.object({
  quizId: z.string(),
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
});

type StartQuizFormSchema = z.infer<typeof StartQuizFormSchema>;

export function StartQuizForm({ quizId }: StartQuizFormProps) {
  const router = useRouter();

  const form = useForm<StartQuizFormSchema>({
    defaultValues: { quizId },
    resolver: zodResolver(StartQuizFormSchema),
  });

  const startQuizMutation = useMutation({
    mutationFn: (data: StartQuizFormSchema) => eden.api.quizzes.start.post(data),
    onSuccess(data, variables, context) {
      const resultId = data.data?.id;
      if (!resultId) return;

      router.push(`/quiz/${resultId}`);
    },
  });

  async function onSubmit(data: StartQuizFormSchema) {
    toast.promise(startQuizMutation.mutateAsync(data), {
      loading: "Iniciando quiz...",
      success: "Quiz iniciado com sucesso!",
      error: "Ocorreu um erro ao iniciar o quiz",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end space-x-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={startQuizMutation.isPending}>
          Iniciar novo quiz
        </Button>
      </form>
    </Form>
  );
}
