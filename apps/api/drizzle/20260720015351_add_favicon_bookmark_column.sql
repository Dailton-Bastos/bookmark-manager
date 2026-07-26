DROP INDEX IF EXISTS "search_index";--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "favicon" text;--> statement-breakpoint
CREATE INDEX "search_index" ON "bookmarks" USING gin ((
				setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
				setweight(to_tsvector('english', coalesce("description", '')), 'B')
			));
