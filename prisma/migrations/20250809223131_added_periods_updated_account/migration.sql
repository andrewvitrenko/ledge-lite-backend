/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EPeriodStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EAccountType" AS ENUM ('ASSET', 'LIABILITY', 'CREDIT', 'SAVINGS');

-- DropIndex
DROP INDEX "Account_name_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "type" "EAccountType" NOT NULL;

-- AlterTable
ALTER TABLE "Deposit" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "periodId" UUID;

-- CreateTable
CREATE TABLE "Period" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "status" "EPeriodStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountPeriodSnapshot" (
    "id" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "startingBalance" DECIMAL(30,12) NOT NULL,
    "endingBalance" DECIMAL(30,12) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountPeriodSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Period_userId_status_idx" ON "Period"("userId", "status");

-- CreateIndex
CREATE INDEX "AccountPeriodSnapshot_periodId_idx" ON "AccountPeriodSnapshot"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountPeriodSnapshot_periodId_accountId_key" ON "AccountPeriodSnapshot"("periodId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_name_key" ON "Account"("userId", "name");

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPeriodSnapshot" ADD CONSTRAINT "AccountPeriodSnapshot_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPeriodSnapshot" ADD CONSTRAINT "AccountPeriodSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
