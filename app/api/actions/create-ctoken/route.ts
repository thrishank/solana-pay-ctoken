import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Keypair,
  Signer,
} from "@solana/web3.js";

import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { headers, RPC_ENDPOINT } from "../common";

// OPTIONS endpoint is required for CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/img.png", req.url).toString()}`,
    label: "Compressed Token",
    title: "Create Compressed Token",
    description:
      "Create a compressed token  using this blink. ZK Compression is a new primitive on Solana that enables you to build applications at scale. This takes adavatage of zkCompresion to reduce storage costs by orders of magnitude while preserving the Solana L1's security, performance, and composability.",
    links: {
      actions: [
        {
          label: "create the token",
          href: "/api/actions/create-ctoken",
          type: "transaction",
          parameters: [
            {
              name: "name",
              label: "Token Name",
              type: "text",
              required: true,
            },
            {
              name: "symbol",
              label: "token symbol",
              type: "text",
              required: true,
            },
            {
              name: "metadata",
              label: "token metadata uri",
              type: "url",
              required: true,
            },
            {
              name: "decimals",
              label: "token decimals",
              type: "number",
              required: true,
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const payer = new PublicKey(account);
    const mint: Signer = Keypair.generate();

    const connection = new Connection(RPC_ENDPOINT);

    const data: any = body.data;

    const instruction = await CompressedTokenProgram.createMint({
      feePayer: payer,
      mint: mint.publicKey,
      decimals: data?.decimals,
      authority: payer,
      freezeAuthority: null,
      rentExemptBalance: 1461600,
    });

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new TransactionMessage({
      recentBlockhash: blockhash,
      payerKey: payer,
      instructions: [],
    });

    transaction.instructions.push(...instruction);

    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    );

    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];

    const tokenMetadata = {
      name: data?.name,
      symbol: data?.symbol,
      uri: data.metadata,
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

    transaction.instructions.push(meta_ix);

    const versionedTransaction = new VersionedTransaction(
      transaction.compileToV0Message(),
    );

    versionedTransaction.sign([mint]);

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(versionedTransaction.serialize()).toString(
        "base64",
      ),
      message: `Compressed Token Created successfully. Mint Address: ${mint.publicKey.toString()}`,
    };

    return Response.json(response, { status: 200, headers });
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
};
