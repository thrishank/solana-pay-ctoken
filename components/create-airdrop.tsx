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
import { Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";
import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";

const claimTokenSchema = z.object({
  mintAddress: z.string().min(32, "Please enter a valid Solana address"),
  amountPerClaim: z.coerce.number().positive("Amount must be greater than 0"),
  totalAmount: z.coerce.number().positive("Amount must be greater than 0"),
});

type ClaimTokenFormValues = z.infer<typeof claimTokenSchema>;

export function CreateAirdrop() {
  const qrRef = useRef<HTMLDivElement>(null);
  const claimQrRef = useRef<HTMLDivElement>(null);
  const [url, setURL] = useState("");
  const [claim, setClaim] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClaimTokenFormValues>({
    resolver: zodResolver(claimTokenSchema),
    defaultValues: {
      mintAddress: "",
      amountPerClaim: 1,
      totalAmount: 100,
    },
  });

  useEffect(() => {
    if (!isModalOpen) return;

    if (url && qrRef.current) {
      const solanaPayUrl = new URL(url);
      const urlFields: TransactionRequestURLFields = { link: solanaPayUrl };
      const qr = createQR(encodeURL(urlFields), 400, "transparent");
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
    }

    if (claim && claimQrRef.current) {
      const claimUrl = new URL(claim);
      const filed: TransactionRequestURLFields = { link: claimUrl };
      const claimQr = createQR(encodeURL(filed), 400, "transparent");
      claimQrRef.current.innerHTML = "";
      claimQr.append(claimQrRef.current);
    }
  }, [url, claim, isModalOpen]);

  async function onSubmit(data: ClaimTokenFormValues) {
    setIsModalOpen(true);
    setIsLoading(true);
    try {
      const res = await fetch("/api/create-airdrop", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create airdrop");

      const res_data = await res.json();

      setURL(
        `https://solana-pay-ctoken.vercel.app/transfer/${res_data.transfer}`,
      );
      setClaim(`https://solana-pay-ctoken.vercel.app/claim/${res_data.claim}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create airdrop",
        variant: "destructive",
      });
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText("solana:" + claim);
    toast({
      title: "URL Copied",
      description: "The URL has been copied to your clipboard",
    });
  };

  const copy_url = () => {
    navigator.clipboard.writeText("solana:" + url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Airdrop</h2>
        <p className="text-sm text-gray-500">
          Create a QR code that allows recipients to claim tokens
        </p>
      </div>

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
                  Total number of tokens to airdrop
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
                Creating...
              </>
            ) : (
              "Create Airdrop"
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-white p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6 pb-0 flex justify-between items-center border-b-0">
              <span>Airdrop QR Codes</span>
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="mt-4 text-sm text-gray-500">
                  Generating QR codes...
                </p>
              </div>
            ) : (
              <>
                {url && (
                  <div>
                    <div className="text-center text-sm font-medium text-gray-800 mb-2">
                      Pay the requested tokens
                    </div>
                    <div
                      ref={qrRef}
                      className="mb-4 flex justify-center items-center rounded-lg border bg-gray-100"
                    />

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
                        onClick={copy_url}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {claim && (
                  <div>
                    <div className="text-center text-sm font-medium text-gray-800 mb-2">
                      Claim tokens
                    </div>
                    <div
                      ref={claimQrRef}
                      className="mb-4 flex justify-center items-center rounded-lg border bg-gray-100"
                    />

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
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
