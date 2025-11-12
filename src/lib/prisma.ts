import { PrismaClient } from "@prisma/client";
import { ensureLatestSchema } from "./schemaGuard";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

const isEdgeRuntime =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

if (!isEdgeRuntime) {
  await ensureLatestSchema(prisma);
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

