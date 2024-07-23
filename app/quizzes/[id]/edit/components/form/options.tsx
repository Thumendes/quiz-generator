"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { MAX_OPTIONS, useQuizForm } from "../../context";
import { OptionSortableItem } from "../sortable/item";
import { SortableRoot } from "../sortable/root";
import { createId } from "@paralleldrive/cuid2";

interface QuizFormOptionsProps {
  parent: number;
}

export function QuizFormOptions({ parent }: QuizFormOptionsProps) {
  const { form, optionId } = useQuizForm();

  const { append, remove, fields, move } = useFieldArray({
    control: form.control,
    name: `questions.${parent}.options`,
    keyName: "key",
  });

  return (
    <div className="space-y-3">
      {fields.length > 0 ? (
        <FormField
          control={form.control}
          name={`questions.${parent}.correctOption`}
          render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
              <div className="space-y-3">
                <SortableRoot
                  ids={fields.map((_, index) => optionId(index))}
                  onMove={(oldIndex, newIndex) => oldIndex >= 0 && newIndex >= 0 && move(oldIndex, newIndex)}
                  overlay={(id) => (
                    <OptionSortableItem id={id}>
                      <div>{id}</div>
                    </OptionSortableItem>
                  )}
                >
                  {fields.map((field, index) => (
                    <OptionSortableItem key={field.id} id={optionId(index)}>
                      <div className="flex space-x-2 items-center justify-between">
                        <RadioGroupItem value={field.id} />

                        <FormField
                          control={form.control}
                          name={`questions.${parent}.options.${index}.title`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input placeholder="Opção" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button size="icon" variant="ghost" type="button" onClick={() => remove(index)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    </OptionSortableItem>
                  ))}
                </SortableRoot>
              </div>
            </RadioGroup>
          )}
        />
      ) : (
        <Skeleton className="p-2 px-3 text-sm">Adicione as opções</Skeleton>
      )}

      {MAX_OPTIONS > fields.length && (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const index = fields.length;
            append({ id: createId(), title: "" });
          }}
        >
          Adicionar
        </Button>
      )}
    </div>
  );
}
