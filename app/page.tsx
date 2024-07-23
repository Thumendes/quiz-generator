import { Button } from "@/components/ui/button";
import { QuizzesService } from "@/server/quizzes/service";
import { Edit } from "lucide-react";
import Link from "next/link";
import { InitQuizDialog } from "./components/init-quiz";

export default async function Home() {
  const service = new QuizzesService();
  const quizzes = await service.findMany();

  return (
    <>
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-xl">Quiz Gen</h1>

        <InitQuizDialog />
      </header>

      <div className="space-y-8">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="transition-all cursor-pointer relative rounded-lg hover:border">
            <img src={quiz?.thumbnail ?? ""} className="aspect-video object-cover w-full rounded-lg" />

            <div className="absolute rounded-b-lg bottom-0 p-4 bg-gradient-to-t from-black/75 w-full">
              <div className="flex items-center justify-between">
                <Link href={`/quizzes/${quiz.id}`}>
                  <div>
                    <h2 className="text-white text-xl font-semibold">{quiz.title}</h2>
                    <p className="text-white text-sm">{quiz.description}</p>
                  </div>
                </Link>

                <Link href={`/quizzes/${quiz.id}/edit`}>
                  <Button size="icon">
                    <Edit className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
