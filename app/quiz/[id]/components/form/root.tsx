"use client";

import { Button } from "@/components/ui/button";
import { eden } from "@/lib/eden/client";
import { cn, delay } from "@/lib/utils";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { toast } from "sonner";

export type QuizFormQuestion = {
  title: string;
  options: string[];
  answer: number;
};

interface QuizFormProps {
  questions: QuizFormQuestion[];
  resultId: string;
  initialTimer?: number;
}

export function QuizForm({ resultId, questions: usingQuiz, initialTimer = 30 }: QuizFormProps) {
  const [currentItem, setCurrentItem] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [status, setStatus] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { height, width } = useWindowSize();
  const [isParty, setIsParty] = useState(false);
  const [timer, setTimer] = useState(initialTimer);
  const [showCorrect, setShowCorrect] = useState(false);

  const currentQuizItem = usingQuiz[currentItem];

  const saveResult = useMutation({
    mutationFn: async ({ resultId, score }: { resultId: string; score: number }) =>
      eden.api.quizzes.saveResult.post({ resultId, score }),
  });

  async function checkAnswer() {
    const isCorrect = answers[currentItem] === currentQuizItem.options[currentQuizItem.answer];

    if (isCorrect) {
      setStatus(true);
      setScore((prev) => prev + 1);
    } else {
      setStatus(false);
    }

    if (!answers[currentItem]) {
      setShowCorrect(true);
      await delay(2000);
    }
    await delay(1000);

    setStatus(null);
    const nextItem = currentItem + 1;

    if (nextItem >= usingQuiz.length) {
      setFinished(true);
      await triggerConfetti();
      return;
    }

    setTimer(initialTimer);
    setShowCorrect(false);
    setCurrentItem((prev) => prev + 1);
  }

  async function handleFinish() {
    toast.promise(saveResult.mutateAsync({ resultId, score }), {
      loading: "Saving your result...",
      success: "Result saved successfully!",
      error: "Failed to save",
    });
  }

  async function triggerConfetti() {
    setIsParty(true);
    await delay(2000);
    setIsParty(false);
  }

  useEffect(() => {
    const interval = timer > 0 && setInterval(() => setTimer(timer - 1), 1000);

    if (timer === 0) {
      checkAnswer();
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [timer]);

  return (
    <div className="space-y-6">
      {finished ? (
        <div className="flex flex-col space-y-4 items-center justify-center">
          <CheckCircledIcon className="size-16 text-green-500" />

          <p className="text-2xl font-semibold">
            You got {score} of {usingQuiz.length} right!
          </p>

          <p className="text-lg text-muted-foreground">
            {score === usingQuiz.length
              ? "Congratulations! You got all the questions right."
              : "Try again to get all questions correct."}
          </p>

          <Button size="lg" onClick={handleFinish}>
            Get back to Ranking
          </Button>
        </div>
      ) : (
        <>
          <div className="flex  justify-between">
            <p className="text-2xl">{currentQuizItem.title}</p>
          </div>

          <ul className="space-y-3">
            {currentQuizItem.options.map((option, index) => {
              const selected = answers[currentItem] === option;
              const isCorrect = currentQuizItem.options[currentQuizItem.answer] === option;

              return (
                <li
                  key={index}
                  onClick={() =>
                    setAnswers((prev) => {
                      const newAnswers = [...prev];
                      newAnswers[currentItem] = option;
                      return newAnswers;
                    })
                  }
                  className={cn(
                    "border px-4 py-3 rounded-md cursor-pointer",
                    selected && "bg-muted font-semibold",
                    showCorrect && isCorrect && "border-green-500 bg-green-100",
                    typeof status === "boolean" &&
                      selected &&
                      (status ? "border-green-500 bg-green-500 text-white" : "border-red-500 bg-red-500 text-white")
                  )}
                >
                  {option}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-start">
                <p className="text-sm text-muted-foreground">Score</p>
                <span className="text-3xl">
                  {score}/{usingQuiz.length}
                </span>
              </div>

              <div className="text-start">
                <p className="text-sm text-muted-foreground">Time</p>
                <span className="text-3xl">{timer}</span>
              </div>
            </div>

            <Button size="lg" onClick={checkAnswer} disabled={typeof status === "boolean"}>
              Next Question
            </Button>
          </div>
        </>
      )}

      {width !== Infinity && height !== Infinity && (
        <Confetti width={width} height={height} numberOfPieces={isParty ? 1000 : 0} />
      )}
    </div>
  );
}
