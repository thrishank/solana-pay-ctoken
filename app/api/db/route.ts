import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();

  const data = await prisma.createToken.findMany();

  return Response.json(data);
}
