/*
  Warnings:

  - The `options` column on the `Quiz` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submittedBy` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submittedBy" TEXT NOT NULL,
DROP COLUMN "options",
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL,
ALTER COLUMN "history" DROP NOT NULL,
ALTER COLUMN "quizCount" DROP NOT NULL,
ALTER COLUMN "currentScore" DROP NOT NULL,
ALTER COLUMN "rank" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
