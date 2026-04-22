CREATE TABLE "bookmark_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookmark_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "bookmark_tags" ADD CONSTRAINT "bookmark_tags_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_tags" ADD CONSTRAINT "bookmark_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmarkId_idx" ON "bookmark_tags" USING btree ("bookmark_id");--> statement-breakpoint
CREATE INDEX "tagId_idx" ON "bookmark_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "name_idx" ON "tags" USING btree ("name");