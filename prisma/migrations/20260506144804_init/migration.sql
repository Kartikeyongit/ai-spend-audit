-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicId" TEXT NOT NULL,
    "tools" JSONB NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "primaryUseCase" TEXT NOT NULL,
    "totalMonthlySpend" DOUBLE PRECISION NOT NULL,
    "totalMonthlySavings" DOUBLE PRECISION NOT NULL,
    "totalAnnualSavings" DOUBLE PRECISION NOT NULL,
    "recommendations" JSONB NOT NULL,
    "aiSummary" TEXT,
    "email" TEXT,
    "companyName" TEXT,
    "role" TEXT,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "companyName" TEXT,
    "role" TEXT,
    "teamSize" INTEGER,
    "auditId" TEXT,
    "highSavings" BOOLEAN NOT NULL DEFAULT false,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_publicId_key" ON "Audit"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
