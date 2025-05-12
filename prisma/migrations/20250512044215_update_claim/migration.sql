/*
  Warnings:

  - You are about to drop the column `claimedWallet` on the `Claim` table. All the data in the column will be lost.
  - Added the required column `privateKey` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "claimedWallet",
ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "claimedBy" TEXT,
ADD COLUMN     "privateKey" TEXT NOT NULL;
