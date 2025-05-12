import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { PrismaClient } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import { bn, createRpc, Rpc } from "@lightprotocol/stateless.js";

export async function GET() {
  return NextResponse.json(
    {
      icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
      label: "Transfer Compressed Tokens",
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

  const data = await prisma.transfer.findUnique({
    where: {
      id,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { account } = await request.json();

  const fromPubkey = new PublicKey(account);
  const toPubkey = new PublicKey(data.recipient);
  const mint_address = new PublicKey(data.mint);

  const RPC_ENDPOINT =
    "https://mainnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079";

  const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

  const { blockhash } = await connection.getLatestBlockhash();

  const compressedTokenAccounts =
    await connection.getCompressedTokenAccountsByOwner(fromPubkey, {
      mint: mint_address,
    });

  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    data.amount,
  );

  const proof = await connection.getValidityProof(
    inputAccounts.map((account) => bn(account.compressedAccount.hash)),
  );

  const instruction = await CompressedTokenProgram.transfer({
    payer: fromPubkey,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: toPubkey,
    amount: data.amount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  });

  transaction.add(instruction);
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
  );

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");

  const message = "transfer compressed tokens";

  return NextResponse.json(
    {
      transaction: base64,
      message,
    },
    { status: 200 },
  );
}
