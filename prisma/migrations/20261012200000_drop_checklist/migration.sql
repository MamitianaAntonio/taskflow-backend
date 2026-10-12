-- Drop the checklist feature: subtasks are now the single way to break a
-- task down. ChecklistItem was never released, so no data is preserved.
DROP TABLE "ChecklistItem";
