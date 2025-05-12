"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";

const claimTokenSchema = z.object({
  mintAddress: z.string().min(32, "Please enter a valid Solana address"),
  amountPerClaim: z.coerce.number().positive("Amount must be greater than 0"),
  totalAmount: z.number(),
});

type ClaimTokenFormValues = z.infer<typeof claimTokenSchema>;

export function CreateAidrop() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [url, setURL] = useState("");
  const claimQrRef = useRef<HTMLDivElement>(null);
  const [claim, setClaim] = useState("");

  const form = useForm<ClaimTokenFormValues>({
    resolver: zodResolver(claimTokenSchema),
    defaultValues: {
      mintAddress: "",
      amountPerClaim: 1,
      totalAmount: 100,
    },
  });

  useEffect(() => {
    if (!url || !qrRef.current) return;

    const solanaPayUrl = new URL(url);
    const urlFields: TransactionRequestURLFields = {
      link: solanaPayUrl,
    };

    const qr = createQR(encodeURL(urlFields), 400, "transparent");
    qrRef.current.innerHTML = "";
    qr.append(qrRef.current);

    if (!claimQrRef.current) return;
    const claimUrl = new URL(claim);
    const filed: TransactionRequestURLFields = {
      link: claimUrl,
    };

    const claimQr = createQR(encodeURL(filed), 400, "transparent");
    claimQrRef.current.innerHTML = "";
    claimQr.append(claimQrRef.current);
  }, [url, claim]);

  async function onSubmit(data: ClaimTokenFormValues) {
    const res = await fetch("/api/create-airdrop", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const res_data = await res.json();

    setURL(
      `https://solana-pay-ctoken.vercel.app/transfer/${res_data.transfer}`,
    );
    setClaim(`https://solana-pay-ctoken.vercel.app/claim/${res_data.claim}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Claim</h2>
        <p className="text-sm text-gray-500">
          Create a QR code that allows recipients to claim tokens
        </p>
      </div>

      {url && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Claim request generated successfully. Share the QR code with
            recipients.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="mintAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mint Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter token mint address" {...field} />
                </FormControl>
                <FormDescription>The address of the token mint</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountPerClaim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Per Claim</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Number of tokens each recipient can claim
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Total Number of tokens to airdrop
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer">
            Generate QR Code To Pay
          </Button>
        </form>
      </Form>

      <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
        {url && (
          <div className="w-full text-center">
            <div className="text-sm font-medium text-gray-800 mb-2">
              Pay the requested tokens
            </div>
            <div
              ref={qrRef}
              className="mx-auto p-4 bg-gray-100 rounded-lg border w-fit"
            />
          </div>
        )}

        {claim && (
          <div>
            <div className="text-base font-semibold text-gray-800">
              QR Code to claim tokens
            </div>
            <div
              ref={claimQrRef}
              className="p-4 bg-gray-100 rounded-lg border w-fit"
            />
          </div>
        )}
      </div>
    </div>
  );
}
