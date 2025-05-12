import { PrismaClient } from "@prisma/client";
import { Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);

    const wallet = Keypair.generate();

    // a transfer request payalod to send the tokens from creator to a new wallet
    const transfer = await prisma.transfer.create({
      data: {
        mint: body.mintAddress,
        amount: body.totalAmount,
        recipient: wallet.publicKey.toString(),
      },
    });

    // store the claim request in the database
    const data = await prisma.claim.create({
      data: {
        mint: body.mintAddress,
        amount: body.amountPerClaim,
        totalAmount: body.totalAmount,
        wallet: wallet.publicKey.toString(),
        privateKey: JSON.stringify(Array.from(wallet.secretKey)),
      },
    });

    return NextResponse.json({
      transfer: transfer.id,
      claim: data.id,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json("Error createing data in db");
  }
}
