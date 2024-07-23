"use client";

import { useQuizForm } from "../../context";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuizFormQuestions } from "./questions";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface QuizFormRootProps {}

export function QuizFormRoot({}: QuizFormRootProps) {
  const { form, handleSubmit, isSubmitting } = useQuizForm();

  return (
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
                <Input placeholder="Descrição" {...field} />
              </FormControl>
              <FormDescription>Explique o conteúdo do Quiz</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <QuizFormQuestions />

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : "Salvar"}
        </Button>

        {/* <pre>{JSON.stringify({ errors: form.formState.errors }, null, 2)}</pre> */}
      </form>
    </Form>
  );
}
