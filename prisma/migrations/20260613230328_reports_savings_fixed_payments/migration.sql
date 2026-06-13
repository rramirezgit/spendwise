-- CreateTable
CREATE TABLE "FixedPayment" (
    "id" TEXT NOT NULL,
    "recurringId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FixedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saving" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'deposit',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Saving_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedPayment_userId_month_idx" ON "FixedPayment"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "FixedPayment_recurringId_month_key" ON "FixedPayment"("recurringId", "month");

-- CreateIndex
CREATE INDEX "Saving_userId_savedAt_idx" ON "Saving"("userId", "savedAt");

-- AddForeignKey
ALTER TABLE "FixedPayment" ADD CONSTRAINT "FixedPayment_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedPayment" ADD CONSTRAINT "FixedPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
