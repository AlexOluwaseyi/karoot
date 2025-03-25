/*
  Warnings:

  - You are about to drop the column `flag` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "flag",
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false;
