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

import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const mintTokenSchema = z.object({
  mintAddress: z.string().min(32, "Please enter a valid Solana address"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  recipient: z.string().min(32, "Please enter a valid Solana address"),
});

type MintTokenFormValues = z.infer<typeof mintTokenSchema>;

export function MintTokenForm() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [url, setURL] = useState("");

  const form = useForm<MintTokenFormValues>({
    resolver: zodResolver(mintTokenSchema),
    defaultValues: {
      mintAddress: "",
      amount: 1,
      recipient: "",
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
  }, [url]);

  async function onSubmit(data: MintTokenFormValues) {
    const res = await fetch("/api/mint", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const id = await res.json();

    setURL(`https://solana-pay-ctoken.vercel.app/mint/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Mint Token</h2>
        <p className="text-sm text-gray-500">Mint new tokens to a recipient</p>
      </div>

      {url && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Mint request generated successfully. Scan the QR code to proceed.
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Number of tokens to mint</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter recipient wallet address"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The wallet address to receive the tokens
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer">
            Generate QR Code
          </Button>
        </form>
      </Form>

      {url && <div ref={qrRef}></div>}
    </div>
  );
}
