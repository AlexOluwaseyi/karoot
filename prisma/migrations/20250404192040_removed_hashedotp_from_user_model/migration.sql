/*
  Warnings:

  - You are about to drop the column `hashedOTP` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_performerId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_targetId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedOTP";

-- DropTable
DROP TABLE "AuditLog";

-- CreateTable
CREATE TABLE "auditlog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performerId" TEXT,
    "targetId" TEXT,

    CONSTRAINT "auditlog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auditlog" ADD CONSTRAINT "auditlog_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditlog" ADD CONSTRAINT "auditlog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
