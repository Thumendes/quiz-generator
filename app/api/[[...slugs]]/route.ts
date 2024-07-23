import { QuizzesService } from "@/server/quizzes/service";
import { Elysia, t } from "elysia";

const quizzes = new Elysia()
  .decorate({ quizzes: new QuizzesService() })
  .get("/quizzes", ({ quizzes }) => quizzes.findMany())
  .get("/quizzes/:id", ({ quizzes, params }) => quizzes.findById(params.id))
  .post("/quizzes", ({ quizzes, body }) => quizzes.init(body), {
    body: t.Object({ title: t.String(), description: t.String() }),
  })
  .put("/quizzes/:id", ({ quizzes, params, body }) => quizzes.update(params.id, body), {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      questions: t.Array(
        t.Object({
          id: t.String(),
          title: t.String(),
          options: t.Array(t.Object({ id: t.String(), title: t.String() })),
          correctOption: t.String(),
        })
      ),
    }),
  })
  .delete("/quizzes/:id", ({ quizzes, params }) => quizzes.delete(params.id))
  .post("/quizzes/generate", ({ quizzes, body }) => quizzes.generate(body), {
    body: t.Object({ title: t.String(), description: t.String() }),
  })
  .post("/quizzes/saveResult", ({ quizzes, body }) => quizzes.saveResult(body.resultId, body.score), {
    body: t.Object({ resultId: t.String(), score: t.Number() }),
  })
  .post("/quizzes/start", ({ quizzes, body }) => quizzes.startQuiz(body.quizId, body.name), {
    body: t.Object({ quizId: t.String(), name: t.String() }),
  });

const app = new Elysia({ prefix: "/api" }).use(quizzes);

export type App = typeof app;

export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle;
