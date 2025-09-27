/*
  Warnings:

  - You are about to drop the column `note` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `name` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "note",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
