"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // const downloadQRCode = () => {
  //   const svg = document.getElementById("qr-code") as SVGElement;
  //   if (svg) {
  //     // Create a canvas element
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     const svgData = new XMLSerializer().serializeToString(svg);
  //     const img = new Image();
  //
  //     // Set canvas dimensions
  //     canvas.width = 200;
  //     canvas.height = 200;
  //
  //     img.onload = () => {
  //       if (ctx) {
  //         ctx.drawImage(img, 0, 0);
  //         const pngUrl = canvas.toDataURL("image/png");
  //
  //         const downloadLink = document.createElement("a");
  //         downloadLink.href = pngUrl;
  //         downloadLink.download = "solana-pay-qr.png";
  //         document.body.appendChild(downloadLink);
  //         downloadLink.click();
  //         document.body.removeChild(downloadLink);
  //       }
  //     };
  //
  //     img.src = "data:image/svg+xml;base64," + btoa(svgData);
  //   }
  // };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
        <QRCodeSVG
          id="qr-code"
          value={value}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <Button variant="outline" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Download QR Code
      </Button>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Scan this QR code with a Solana Pay compatible wallet to proceed with
        the transaction
      </p>
    </div>
  );
}
