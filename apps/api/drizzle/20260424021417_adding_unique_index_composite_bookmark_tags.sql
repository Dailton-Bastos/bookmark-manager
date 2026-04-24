DROP INDEX "bookmarkId_idx";--> statement-breakpoint
DROP INDEX "tagId_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "bookmark_tag_unique_idx" ON "bookmark_tags" USING btree ("bookmark_id","tag_id");