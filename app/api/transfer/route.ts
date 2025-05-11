import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const data = await prisma.transfer.create({
      data: {
        mint: body.mintAddress,
        amount: body.amount,
        recipient: body.recipient,
      },
    });
    return NextResponse.json(data.id);
  } catch (err) {
    console.log(err);

    return NextResponse.json("Error createing data in db");
  }
}
