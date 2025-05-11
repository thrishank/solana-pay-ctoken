"use client";
import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay";
import { useRef, useEffect } from "react";

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
    <div>
      <h1>Solana</h1>
      <div ref={qrRef}></div>
    </div>
  );
}
