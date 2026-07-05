/*
  Warnings:

  - You are about to drop the column `periodId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `AccountPeriodSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Period` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountPeriodSnapshot" DROP CONSTRAINT "AccountPeriodSnapshot_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountPeriodSnapshot" DROP CONSTRAINT "AccountPeriodSnapshot_periodId_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_periodId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "periodId";

-- DropTable
DROP TABLE "AccountPeriodSnapshot";

-- DropTable
DROP TABLE "Period";

-- DropEnum
DROP TYPE "EPeriodStatus";
