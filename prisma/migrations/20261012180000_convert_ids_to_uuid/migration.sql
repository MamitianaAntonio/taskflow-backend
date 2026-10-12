-- Convert integer primary keys to random UUID strings
-- (data-preserving: new uuid columns are backfilled, child FKs remapped, old columns dropped)

-- 1. Ensure gen_random_uuid() is available (built-in on PostgreSQL >= 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop all foreign keys between the tables being converted
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tc.table_name AS tbl, tc.constraint_name AS con
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('UserAccount', 'Project', 'Todo', 'Notification')
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.tbl, r.con);
  END LOOP;
END $$;

-- 3. Convert primary keys of parent tables to UUID strings
ALTER TABLE "UserAccount" RENAME COLUMN "id" TO "id_old";
ALTER TABLE "UserAccount" ADD COLUMN "id" TEXT;
UPDATE "UserAccount" SET "id" = (gen_random_uuid())::text;
ALTER TABLE "UserAccount" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_pkey";
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id");

ALTER TABLE "Project" RENAME COLUMN "id" TO "id_old";
ALTER TABLE "Project" ADD COLUMN "id" TEXT;
UPDATE "Project" SET "id" = (gen_random_uuid())::text;
ALTER TABLE "Project" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey";
ALTER TABLE "Project" ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

ALTER TABLE "Todo" RENAME COLUMN "id" TO "id_old";
ALTER TABLE "Todo" ADD COLUMN "id" TEXT;
UPDATE "Todo" SET "id" = (gen_random_uuid())::text;
ALTER TABLE "Todo" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_pkey";
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_pkey" PRIMARY KEY ("id");

ALTER TABLE "Notification" RENAME COLUMN "id" TO "id_old";
ALTER TABLE "Notification" ADD COLUMN "id" TEXT;
UPDATE "Notification" SET "id" = (gen_random_uuid())::text;
ALTER TABLE "Notification" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");

-- 4. Convert and remap child foreign-key columns
ALTER TABLE "Todo" ALTER COLUMN "userId" SET DATA TYPE TEXT;
UPDATE "Todo" SET "userId" = u."id"
FROM "UserAccount" u
WHERE "Todo"."userId" = u."id_old"::text;
ALTER TABLE "Todo" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Todo" ALTER COLUMN "projectId" SET DATA TYPE TEXT;
UPDATE "Todo" SET "projectId" = p."id"
FROM "Project" p
WHERE "Todo"."projectId" = p."id_old"::text;

ALTER TABLE "Project" ALTER COLUMN "userId" SET DATA TYPE TEXT;
UPDATE "Project" SET "userId" = u."id"
FROM "UserAccount" u
WHERE "Project"."userId" = u."id_old"::text;
ALTER TABLE "Project" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Notification" ALTER COLUMN "userId" SET DATA TYPE TEXT;
UPDATE "Notification" SET "userId" = u."id"
FROM "UserAccount" u
WHERE "Notification"."userId" = u."id_old"::text;
ALTER TABLE "Notification" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Notification" ALTER COLUMN "todoId" SET DATA TYPE TEXT;
UPDATE "Notification" SET "todoId" = t."id"
FROM "Todo" t
WHERE "Notification"."todoId" = t."id_old"::text;

-- 5. Recreate foreign keys with the same behavior as before
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Drop the temporary integer id columns
ALTER TABLE "UserAccount" DROP COLUMN "id_old";
ALTER TABLE "Project" DROP COLUMN "id_old";
ALTER TABLE "Todo" DROP COLUMN "id_old";
ALTER TABLE "Notification" DROP COLUMN "id_old";