/*
  Warnings:

  - Added the required column `decimals` to the `CreateToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreateToken" ADD COLUMN     "decimals" INTEGER NOT NULL;
