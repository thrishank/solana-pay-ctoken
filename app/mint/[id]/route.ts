import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { RPC_ENDPOINT } from "@/app/api/actions/common";

export async function GET() {
  return NextResponse.json(
    {
      icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
      label: "Mint Compressed Tokens",
    },
    { status: 200 },
  );
}

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const data = await prisma.mint.findUnique({
    where: {
      id,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { account } = await request.json();

  let payer, toPubkey, mint_address;
  try {
    payer = new PublicKey(account);
    toPubkey = new PublicKey(data.recipient);
    mint_address = new PublicKey(data.mint);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Invalid public key provided" },
      { status: 400 },
    );
  }

  console.log(payer, toPubkey, mint_address);

  const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

  const { blockhash } = await connection.getLatestBlockhash();

  const instruction = await CompressedTokenProgram.mintTo({
    feePayer: payer,
    mint: mint_address,
    authority: payer,
    amount: data.amount,
    toPubkey,
  });

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payer,
  });

  transaction.add(instruction);
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
  );

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");

  const message = "Mint compressed tokens";

  return NextResponse.json(
    {
      transaction: base64,
      message,
    },
    { status: 200 },
  );
}
