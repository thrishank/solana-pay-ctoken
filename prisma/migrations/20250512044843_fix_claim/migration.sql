/*
  Warnings:

  - You are about to drop the column `claimedAt` on the `Claim` table. All the data in the column will be lost.
  - The `claimedBy` column on the `Claim` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Claim" DROP COLUMN "claimedAt",
DROP COLUMN "claimedBy",
ADD COLUMN     "claimedBy" TEXT[];
