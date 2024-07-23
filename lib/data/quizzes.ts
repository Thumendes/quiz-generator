import { faker } from "@faker-js/faker/locale/pt_BR";
import { range } from "../utils";

export async function getQuizzes() {
  return range(0, 10).map((index) => ({
    id: index,
    title: faker.lorem.words(),
    description: faker.lorem.sentence(),
    image: faker.image.url(),
  }));
}
