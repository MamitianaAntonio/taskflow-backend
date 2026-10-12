-- AlterTable
ALTER TABLE "public"."UserAccount" ALTER COLUMN "password" DROP NOT NULL,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "authSource" TEXT NOT NULL DEFAULT 'credentials';

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_googleId_key" ON "public"."UserAccount"("googleId");
