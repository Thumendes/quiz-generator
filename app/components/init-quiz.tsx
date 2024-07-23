"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { eden } from "@/lib/eden/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface InitQuizDialogProps {}

const InitQuizSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  description: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres"),
});

type InitQuizForm = z.infer<typeof InitQuizSchema>;

export function InitQuizDialog({}: InitQuizDialogProps) {
  const router = useRouter();
  const form = useForm<InitQuizForm>({ resolver: zodResolver(InitQuizSchema) });

  const initMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => eden.api.quizzes.post(data),
  });

  const [open, setOpen] = useState(false);

  const handleSubmit = form.handleSubmit(async (data) => {
    initMutation.mutate(data, {
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

        router.push(`/quizzes/${data.id}/edit`);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Novo Quiz</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deseja criar um novo quiz?</DialogTitle>
          <DialogDescription>
            Ao criar um novo quiz, você poderá adicionar perguntas e respostas para que seus usuários possam responder.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título" {...field} />
                  </FormControl>
                  <FormDescription>Texto resumido para identificar o quiz</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição" {...field} />
                  </FormControl>
                  <FormDescription>Explique o conteúdo do Quiz</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Criar Quiz</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
