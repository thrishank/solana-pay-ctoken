import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const data = await prisma.createToken.create({
      data: {
        tokenName: body.tokenName,
        url: body.uri,
        symbol: body.symbol,
        decimals: body.decimals,
      },
    });
    return NextResponse.json(data.id);
  } catch (err) {
    console.log(err);

    return NextResponse.json("Error createing data in db");
  }
}
