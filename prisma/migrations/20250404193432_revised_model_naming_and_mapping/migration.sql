/*
  Warnings:

  - You are about to drop the `auditlog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auditlog" DROP CONSTRAINT "auditlog_performerId_fkey";

-- DropForeignKey
ALTER TABLE "auditlog" DROP CONSTRAINT "auditlog_targetId_fkey";

-- DropForeignKey
ALTER TABLE "otp" DROP CONSTRAINT "otp_userId_fkey";

-- DropTable
DROP TABLE "auditlog";

-- DropTable
DROP TABLE "otp";

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performerId" TEXT,
    "targetId" TEXT,
    "quizId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "hashedOTP" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("quizId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
