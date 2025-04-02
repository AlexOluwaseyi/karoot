/*
  Warnings:

  - You are about to drop the column `approvedBy` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `submittedBy` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "approvedBy",
DROP COLUMN "submittedBy",
ALTER COLUMN "submitterId" DROP DEFAULT;
