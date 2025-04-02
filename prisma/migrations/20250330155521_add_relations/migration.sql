-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "performerId" TEXT,
ADD COLUMN     "targetId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "approverId" TEXT DEFAULT 'pending',
ADD COLUMN     "submitterId" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
