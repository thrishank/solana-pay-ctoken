import {
  ActionGetResponse,
  ActionParameter,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";

import {
  ComputeBudgetProgram,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import { bn, createRpc, Rpc } from "@lightprotocol/stateless.js";
import { headers, RPC_ENDPOINT } from "../common";

export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const mint = url.searchParams.get("mint");
  const recipient = url.searchParams.get("recipient");

  let posthref = mint
    ? `/api/actions/transfer?recipient=${recipient}&mint=${mint}`
    : `/api/actions/transfer?recipient=${recipient}`;

  if (!recipient) {
    return new Response(JSON.stringify({ error: "Recipient is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Define parameters array - only include mint parameter if not provided in URL
  const parameters: Array<ActionParameter<any, any>> = [
    // Only include mint parameter if it's not provided in the URL
    ...(mint
      ? []
      : [
          {
            name: "mint",
            label: "Token Mint Address",
            type: "text" as const,
            required: true,
          },
        ]),
    {
      name: "amount",
      label: "token amount (raw)",
      type: "number" as const,
      required: true,
    },
  ];

  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/img.png", req.url).toString()}`,
    label: "Compressed Token",
    title: "Transfer Compressed Token",
    description: "Transfer a compressed token using this blink.",
    links: {
      actions: [
        {
          label: "Transfer",
          href: posthref,
          type: "transaction",
          parameters,
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
  const url = new URL(req.url);
  const recipient = url.searchParams.get("recipient")!;
  let mint = url.searchParams.get("mint");

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

    const data: any = body.data;

    const fromPubkey = new PublicKey(account);
    const toPubkey = new PublicKey(recipient);

    if (!mint) {
      mint = data.mint;
    }

    const mint_address = new PublicKey(mint!);

    const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

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

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new TransactionMessage({
      recentBlockhash: blockhash,
      payerKey: fromPubkey,
      instructions: [],
    });

    transaction.instructions.push(instruction);
    transaction.instructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
    );

    const versionedTransaction = new VersionedTransaction(
      transaction.compileToV0Message(),
    );

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(versionedTransaction.serialize()).toString(
        "base64",
      ),
      message: "Transaction successfully",
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
