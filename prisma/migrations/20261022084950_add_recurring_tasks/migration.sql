-- CreateEnum
CREATE TYPE "RepeatRule" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "repeat" "RepeatRule" NOT NULL DEFAULT 'none',
ADD COLUMN     "repeatAnchorDay" INTEGER;

-- CreateIndex
CREATE INDEX "Todo_repeat_idx" ON "Todo"("repeat");
