/*
  Warnings:

  - Made the column `userId` on table `Otp` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
