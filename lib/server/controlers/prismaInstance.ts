import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
  log: ["error"],
});

// TODO add singleton (object.freeze doesnt work)

export default prismaClient;
