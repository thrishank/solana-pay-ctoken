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

  const { account } = await request.json();
  const payer = new PublicKey(account);
  const toPubkey = new PublicKey(recipient);

  const mint_address = new PublicKey(mint);

  const RPC_ENDPOINT =
    "https://devnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079";

  const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

  const { blockhash } = await connection.getLatestBlockhash();

  // @ts-expect-error mintTo method type signature is not correctly inferred from the SDK
  const instruction = await CompressedTokenProgram.mintTo({
    feePayer: payer,
    mint: mint_address,
    authority: payer,
    amount,
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
