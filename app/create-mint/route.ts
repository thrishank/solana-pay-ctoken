import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

export async function GET() {
  return NextResponse.json(
    {
      icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
      label: "Create Compressed Token",
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const decimals = url.searchParams.get("decimals")!;

  const { account } = await request.json();

  const payer = new PublicKey(account);
  const mint = Keypair.generate();

  const RPC_ENDPOINT =
    "https://devnet.helius-rpc.com/?api-key=20475b23-b7f2-46be-badc-ad4f62baf079";

  const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

  const rentExemptBalance =
    await connection.getMinimumBalanceForRentExemption(82);

  const instruction = await CompressedTokenProgram.createMint({
    feePayer: payer,
    mint: mint.publicKey,
    decimals: parseInt(decimals),
    authority: payer,
    freezeAuthority: null,
    rentExemptBalance,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: payer,
  });

  transaction.add(...instruction);

  const metadataPDA = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];

  const tokenMetadata = {
    name: "My Token",
    symbol: "MYT",
    uri: "https://example.com/metadata.json",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  const meta_ix = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mint.publicKey,
      mintAuthority: payer,
      payer: payer,
      updateAuthority: payer,
    },
    {
      createMetadataAccountArgsV3: {
        data: tokenMetadata,
        isMutable: true,
        collectionDetails: null,
      },
    },
  );

  transaction.add(meta_ix);

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  });
  const base64 = serializedTransaction.toString("base64");

  const message = "Create Compressed Token";

  return NextResponse.json(
    {
      transaction: base64,
      message,
    },
    { status: 200 },
  );
}
