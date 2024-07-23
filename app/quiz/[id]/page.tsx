import { QuizzesService } from "@/server/quizzes/service";
import { notFound } from "next/navigation";
import { QuizForm, QuizFormQuestion } from "./components/form/root";

export default async function QuizResultPage({ params }: { params: { id: string } }) {
  const service = new QuizzesService();
  const result = await service.getResult(params.id);

  if (!result) {
    return notFound();
  }

  const quiz = await service.findById(result.quizId);

  if (!quiz) {
    return notFound();
  }

  return (
    <div className="h-screen flex flex-col justify-center">
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </header>

        <QuizForm
          resultId={result.id}
          questions={quiz.questions.map((question) => {
            const answerIndex = question.options.findIndex((option) => option.isCorrect);

            return {
              title: question.title,
              options: question.options.map((option) => option.title),
              answer: answerIndex,
            } satisfies QuizFormQuestion;
          })}
        />
      </div>
    </div>
  );
}
