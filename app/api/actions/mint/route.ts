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
} from "@solana/web3.js";

import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
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
    title: "Mint Compressed Token",
    description: "Mint a compressed token using this blink",
    links: {
      actions: [
        {
          label: "Mint the token",
          href: "/api/actions/mint",
          type: "transaction",
          parameters: [
            {
              name: "mint",
              label: "Token Mint Address",
              type: "text",
              required: true,
            },
            {
              name: "amount",
              label: "token amount (raw)",
              type: "number",
              required: true,
            },
            {
              name: "recipient",
              label: "minted token recipient",
              type: "text",
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

    const connection = new Connection(RPC_ENDPOINT);

    const data: any = body.data;

    const mint_address = new PublicKey(data.mint);
    const toPubkey = new PublicKey(data.recipient);

    const instruction = await CompressedTokenProgram.mintTo({
      feePayer: payer,
      mint: mint_address,
      authority: payer,
      amount: data.amount,
      toPubkey,
    });

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new TransactionMessage({
      recentBlockhash: blockhash,
      payerKey: payer,
      instructions: [],
    });

    transaction.instructions.push(instruction);

    const versionedTransaction = new VersionedTransaction(
      transaction.compileToV0Message(),
    );

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(versionedTransaction.serialize()).toString(
        "base64",
      ),
      message: `${data.amount} Tokens Minted to ${toPubkey.toString()} successfully`,
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
