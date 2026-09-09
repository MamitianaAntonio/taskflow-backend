-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "reminderStage" TEXT,
ADD COLUMN     "todoId" INTEGER;

-- CreateIndex
CREATE INDEX "Notification_todoId_reminderStage_idx" ON "Notification"("todoId", "reminderStage");
