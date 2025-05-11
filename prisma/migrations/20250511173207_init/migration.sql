-- CreateTable
CREATE TABLE "CreateToken" (
    "id" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "CreateToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mint" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mint" TEXT NOT NULL,

    CONSTRAINT "Mint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mint" TEXT NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);
