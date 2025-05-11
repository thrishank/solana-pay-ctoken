import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET() {
  const data = await prisma.createToken.create({
    data: {
      tokenName: "CTOKEN",
      symbol: "CTK",
      url: "https://example.com",
      decimals: 9,
    },
  });

  console.log(data.id);

  return Response.json(data.id);
}
