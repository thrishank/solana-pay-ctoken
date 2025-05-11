"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

const claimTokenSchema = z.object({
  mintAddress: z.string().min(32, "Please enter a valid Solana address"),
  amountPerClaim: z.coerce.number().positive("Amount must be greater than 0"),
})

type ClaimTokenFormValues = z.infer<typeof claimTokenSchema>

export function ClaimTokenForm() {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ClaimTokenFormValues>({
    resolver: zodResolver(claimTokenSchema),
    defaultValues: {
      mintAddress: "",
      amountPerClaim: 1,
    },
  })

  function onSubmit(data: ClaimTokenFormValues) {
    // In a real app, this would generate a Solana Pay URL
    const solanaPayUrl = `solana:${encodeURIComponent(
      JSON.stringify({
        action: "claim-token",
        mintAddress: data.mintAddress,
        amountPerClaim: data.amountPerClaim,
      }),
    )}`

    setQrCodeData(solanaPayUrl)
    setIsSuccess(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Claim</h2>
        <p className="text-sm text-gray-500">Create a QR code that allows recipients to claim tokens</p>
      </div>

      {isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Claim request generated successfully. Share the QR code with recipients.
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
                <FormDescription>Number of tokens each recipient can claim</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Generate QR Code
          </Button>
        </form>
      </Form>

      {qrCodeData && (
        <div className="mt-8">
          <QRCodeDisplay value={qrCodeData} />
        </div>
      )}
    </div>
  )
}
