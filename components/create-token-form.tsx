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

const createTokenSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less"),
  uri: z.string().url("Please enter a valid URI"),
  decimals: z.coerce
    .number()
    .int()
    .min(0)
    .max(9, "Decimals must be between 0 and 9"),
});

type CreateTokenFormValues = z.infer<typeof createTokenSchema>;

export function CreateTokenForm() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [url, setURL] = useState("");

  const form = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      tokenName: "",
      symbol: "",
      uri: "",
      decimals: 9,
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

  async function onSubmit(data: CreateTokenFormValues) {
    const res = await fetch("/api/create-token", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const id = await res.json();

    setURL(`https://solana-pay-ctoken.vercel.app/create-token/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Token</h2>
        <p className="text-sm text-gray-500">
          Create a new compressed token on Solana
        </p>
      </div>

      {url && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Token creation request generated successfully. Scan the QR code to
            proceed.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tokenName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Token" {...field} />
                </FormControl>
                <FormDescription>The name of your token</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="MAT" {...field} />
                </FormControl>
                <FormDescription>
                  A short symbol for your token (max 10 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/token-metadata.json"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL to your token&apos;s metadata
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="decimals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimals</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Number of decimal places (0-9)
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
