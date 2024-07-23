import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuizzesService } from "@/server/quizzes/service";
import { notFound } from "next/navigation";
import { StartQuizForm } from "./components/form";

export default async function QuizGamePage({ params }: { params: { id: string } }) {
  const service = new QuizzesService();
  const quiz = await service.findById(params.id);

  if (!quiz) {
    return notFound();
  }

  const ranking = await service.getRanking(params.id);

  return (
    <div className="h-screen flex flex-col justify-center">
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </header>

        <Table>
          <TableCaption>Classificação do Ranking</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.name}</TableCell>
                <TableCell className="text-right">{result.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <footer>
          <StartQuizForm quizId={quiz.id} />
        </footer>
      </div>
    </div>
  );
}
