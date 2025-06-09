import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from '../../../generated/prisma';

declare global {
  var prismadb: PrismaClient | undefined;
}

// Use the existing instance if it exists, otherwise create a new one
const prisma = globalThis.prismadb || new PrismaClient();

// Only assign it in development to avoid multiple instances in dev reloads
if (process.env.NODE_ENV !== "production") globalThis.prismadb = prisma;

export default prisma;
