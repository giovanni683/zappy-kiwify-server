import { PrismaClient } from "@prisma/client"
class Prisma {
  public static instance() {
    return new PrismaClient({
      log: ["error", "warn", "query"],
      errorFormat: "pretty"
    });
  }
}
export const prisma = Prisma.instance();
export type PrismaClientType = PrismaClient;