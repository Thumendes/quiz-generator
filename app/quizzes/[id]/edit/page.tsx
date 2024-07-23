import { QuizzesService } from "@/server/quizzes/service";
import { QuizFormRoot } from "./components/form/root";
import { QuizFormContextProvider } from "./context";
import { notFound } from "next/navigation";

export default async function CreateQuizPage({ params }: { params: { id: string } }) {
  const service = new QuizzesService();

  const quiz = await service.findById(params.id);

  if (!quiz) {
    return notFound();
  }

  return (
    <QuizFormContextProvider quiz={quiz}>
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-xl">Criar novo quiz</h1>
      </header>

      <QuizFormRoot />
    </QuizFormContextProvider>
  );
}
