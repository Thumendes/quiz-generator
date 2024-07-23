import { App } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysiajs/eden";

export const eden = treaty<App>("localhost:3000");
