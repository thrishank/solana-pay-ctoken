import { ACTIONS_CORS_HEADERS, BLOCKCHAIN_IDS } from "@solana/actions";

const blockchain = BLOCKCHAIN_IDS.mainnet;

export const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

export const RPC_ENDPOINT =
  "https://devnet.helius-rpc.com/?api-key=c991f045-ba1f-4d71-b872-0ef87e7f039d";
