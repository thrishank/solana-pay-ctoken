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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { useToast } from "@/lib/use-toast";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    if (!url || !qrRef.current || !isModalOpen) return;

    const solanaPayUrl = new URL(url);
    const urlFields: TransactionRequestURLFields = {
      link: solanaPayUrl,
    };

    const qr = createQR(encodeURL(urlFields), 400, "transparent");
    qrRef.current.innerHTML = "";
    qr.append(qrRef.current);
  }, [url, isModalOpen]);

  async function onSubmit(data: CreateTokenFormValues) {
    setIsLoading(true);
    setIsModalOpen(true);
    try {
      const res = await fetch("/api/create-token", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const id = await res.json();
      setURL(`https://solana-pay-ctoken.vercel.app/create-token/${id}`);
    } catch (err) {
      console.error("Error generating token creation request:", err);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate token creation request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      toast({
        title: "Token Creation Request",
        description: "Token creation request generated successfully",
        variant: "default",
      });
    }
  }

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText("solana:" + url);
    toast({
      title: "URL Copied",
      description: "The URL has been copied to your clipboard",
    });
  };

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
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Solana Pay QR Code"
            )}
          </Button>{" "}
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6 pb-0 flex justify-between items-center border-b-0">
              <span>Scan QR Code</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="sr-only">Close</span>
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="mt-4 text-sm text-gray-500">
                  Generating QR code...
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={qrRef}
                  className="mb-4 flex justify-center items-center"
                ></div>

                <div className="relative mt-4 w-full">
                  <Input
                    value={"solana:" + url}
                    readOnly
                    className="w-full pr-16 text-sm text-gray-500 truncate cursor-default"
                    title={"solana:" + url}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2 hover:bg-transparent"
                    onClick={copyUrlToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy URL</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
