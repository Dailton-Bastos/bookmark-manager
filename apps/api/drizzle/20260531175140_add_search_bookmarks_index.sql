CREATE INDEX "search_index" ON "bookmarks" USING gin ((
          setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("description", '')), 'B')
      ));