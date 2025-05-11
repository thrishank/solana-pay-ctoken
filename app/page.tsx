"use client";
import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";

import { useRef, useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTokenForm } from "@/components/create-token-form";
import { MintTokenForm } from "@/components/mint-token-form";
import { TransferTokenForm } from "@/components/transfer-token-form";
import { ClaimTokenForm } from "@/components/claim-token-form";
export default function Home() {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = new URL("https://solana-pay-ctoken.vercel.app/create-mint");
    const urlFields: TransactionRequestURLFields = {
      link: url,
    };

    const qr = createQR(encodeURL(urlFields), 400, "transparent");

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-grey-900 md:text-4xl">
            Solana Pay Compressed Tokens
          </h1>
          <p className="mt-3 text-gray-500">
            Create, mint, transfer, and claim compressed tokens using Solana Pay
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="create"
                className="flex flex-col items-center gap-1 py-3"
              >
                <span className="hidden md:inline">Create Token</span>
              </TabsTrigger>
              <TabsTrigger
                value="mint"
                className="flex flex-col items-center gap-1 py-3"
              >
                <span className="hidden md:inline">Mint</span>
              </TabsTrigger>
              <TabsTrigger
                value="transfer"
                className="flex flex-col items-center gap-1 py-3"
              >
                <span className="hidden md:inline">Transfer</span>
              </TabsTrigger>
              <TabsTrigger
                value="claim"
                className="flex flex-col items-center gap-1 py-3"
              >
                <span className="hidden md:inline">Claim</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="create">
                <CreateTokenForm />
              </TabsContent>
              <TabsContent value="mint">
                <MintTokenForm />
              </TabsContent>
              <TabsContent value="transfer">
                <TransferTokenForm />
              </TabsContent>
              <TabsContent value="claim">
                <ClaimTokenForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
