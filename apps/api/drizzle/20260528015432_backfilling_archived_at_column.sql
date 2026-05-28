-- Custom SQL migration file, put your code below! --
 UPDATE "bookmarks"
 SET "archived_at" = "updated_at"
 WHERE "is_archived" = true
  AND "archived_at" IS NULL;
