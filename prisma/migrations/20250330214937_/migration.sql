/*
  Warnings:

  - You are about to drop the column `performedBy` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetUser` on the `AuditLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "performedBy",
DROP COLUMN "targetUser";
