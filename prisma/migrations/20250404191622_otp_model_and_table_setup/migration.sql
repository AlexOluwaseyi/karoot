-- CreateTable
CREATE TABLE "otp" (
    "id" TEXT NOT NULL,
    "hashedOTP" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
