import { PublicKey, Transaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { createRpc, Rpc } from "@lightprotocol/stateless.js";

export async function GET() {
  return NextResponse.json(
    {
      icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
      label: "Mint Compressed Tokens",
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const recipient = url.searchParams.get("recipient")!;
  const amount = url.searchParams.get("amount")!;
  const mint = url.searchParams.get("mint")!;

  if (!recipient || !amount || !mint) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { account } = await request.json();

  let payer, toPubkey, mint_address;
  try {
    payer = new PublicKey(account);
    toPubkey = new PublicKey(recipient);
    mint_address = new PublicKey(mint);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Invalid public key provided" },
      { status: 400 },
    );
  }

  console.log(payer, toPubkey, mint_address);

  const RPC_ENDPOINT =
    "https://devnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079";

  const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

  const { blockhash } = await connection.getLatestBlockhash();

  const instruction = await CompressedTokenProgram.mintTo({
    feePayer: payer,
    mint: mint_address,
    authority: payer,
    amount: parseInt(amount),
    toPubkey,
  });

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payer,
  });

  transaction.add(instruction);

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
