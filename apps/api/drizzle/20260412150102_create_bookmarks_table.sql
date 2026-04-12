CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"last_visited" timestamp,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "title_idx" ON "bookmarks" USING btree ("title");--> statement-breakpoint
CREATE INDEX "ownerId_idx" ON "bookmarks" USING btree ("owner_id");