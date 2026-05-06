CREATE INDEX "lastVisited_idx" ON "bookmarks" USING btree ("last_visited");--> statement-breakpoint
CREATE INDEX "visitCount_idx" ON "bookmarks" USING btree ("visit_count");
