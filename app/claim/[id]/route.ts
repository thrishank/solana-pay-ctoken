import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
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
      label: "Claim your Compressed Tokens",
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

  const data = await prisma.claim.findUnique({
    where: {
      id,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { account } = await request.json();

  // testing
  const claimed = data.claimedBy.includes(account);

  if (claimed) {
    return NextResponse.json({ error: "Already claimed" }, { status: 400 });
  }

  const fromPubkey = new PublicKey(data.wallet);
  const toPubkey = new PublicKey(account);
  const mint_address = new PublicKey(data.mint);

  const RPC_ENDPOINT =
    "https://mainnet.helius-rpc.com/?api-key=c991f045-ba1f-4d71-b872-0ef87e7f039d";

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
    payer: toPubkey,
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

  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(data.privateKey)),
  );

  console.log(wallet.publicKey);

  // await connection.requestAirdrop(wallet.publicKey, 0.05 * LAMPORTS_PER_SOL);

  transaction.partialSign(wallet);

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");

  const message = "claim your compressed tokens";

  await prisma.claim.update({
    where: {
      id,
    },
    data: {
      claimedBy: {
        push: account,
      },
      totalAmount: {
        decrement: data.amount,
      },
    },
  });

  return NextResponse.json(
    {
      transaction: base64,
      message,
    },
    { status: 200 },
  );
}
