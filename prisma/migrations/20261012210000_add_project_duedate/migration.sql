-- Give a project a deadline so it reads as a goal, not just a folder.
ALTER TABLE "Project" ADD COLUMN "dueDate" TIMESTAMP(3);
