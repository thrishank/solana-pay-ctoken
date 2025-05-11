import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
      label: "Solana pay testing",
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const { account } = await request.json();

  const fromPubkey = new PublicKey(account);
  const toPubkey = new PublicKey(
    "EXBdeRCdiNChKyD7akt64n9HgSXEpUtpPEhmbnm4L6iH",
  );

  const connection = new Connection(clusterApiUrl("devnet"));

  const { blockhash } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  });

  const instruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  });

  transaction.add(instruction);

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");

  const message = "Simple transfer of 0.001 SOL";

  return NextResponse.json(
    {
      transaction: base64,
      message,
    },
    { status: 200 },
  );
}
