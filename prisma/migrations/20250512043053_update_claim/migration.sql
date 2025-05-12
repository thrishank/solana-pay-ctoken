/*
  Warnings:

  - Added the required column `claimedWallet` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "claimedWallet" TEXT NOT NULL,
ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ADD COLUMN     "wallet" TEXT NOT NULL;
