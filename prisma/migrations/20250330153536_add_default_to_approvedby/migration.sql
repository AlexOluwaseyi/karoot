-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "approvedBy" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" JSONB NOT NULL,
    "targetUser" JSONB NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
