"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createId } from "@paralleldrive/cuid2";
import { Copy, Sparkles, Trash } from "lucide-react";
import { useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { useQuizForm } from "../../context";
import { QuestionSortableItem } from "../sortable/item";
import { SortableRoot } from "../sortable/root";
import { QuizFormOptions } from "./options";

interface QuizFormQuestionsProps {}

export function QuizFormQuestions({}: QuizFormQuestionsProps) {
  const { form, handleGenerate, isGenerating, questionId } = useQuizForm();

  const { append, remove, fields, move } = useFieldArray({ control: form.control, name: "questions", keyName: "key" });

  const title = form.watch("title");
  const description = form.watch("description");

  const canGenerate = useMemo(() => title && description, [title, description]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Label>Questões</Label>

        <div className="space-x-3">
          {canGenerate && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="animate-pulse"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              Gerar
              <Sparkles className="size-4 ml-2 text-yellow-500" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                id: createId(),
                title: "",
                correctOption: "0",
                options: [{ id: createId(), title: "" }],
              })
            }
            disabled={isGenerating}
          >
            Adicionar Questão
          </Button>
        </div>
      </div>

      {isGenerating && (
        <Skeleton className="p-4 flex items-center justify-center">
          <span>Gerando questões...</span>
        </Skeleton>
      )}

      <div className="space-y-4">
        <SortableRoot
          ids={fields.map((_, index) => questionId(index))}
          onMove={(oldIndex, newIndex) => oldIndex >= 0 && newIndex >= 0 && move(oldIndex, newIndex)}
          overlay={(id) => (
            <QuestionSortableItem id={id}>
              <div>{id}</div>
            </QuestionSortableItem>
          )}
        >
          {fields.map((field, index) => (
            <QuestionSortableItem key={field.id} id={questionId(index)}>
              <div className="p-3 space-y-3">
                <FormField
                  control={form.control}
                  name={`questions.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Questão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <QuizFormOptions parent={index} />
              </div>

              <Separator />

              <div className="flex items-center justify-end p-2">
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    const data = form.getValues(`questions.${index}`);
                    append(data);
                  }}
                >
                  <Copy className="size-4" />
                </Button>

                <Button size="icon" variant="ghost" type="button" onClick={() => remove(index)}>
                  <Trash className="size-4" />
                </Button>
              </div>
            </QuestionSortableItem>
          ))}
        </SortableRoot>
      </div>
    </div>
  );
}
