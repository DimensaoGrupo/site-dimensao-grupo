import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

// better-sqlite3 needs a native (node-gyp) build step that this environment
// can't run (no Visual Studio Build Tools installed). node:sqlite ships
// built into Node itself (stable since Node 22.5), so it's used directly
// here via Drizzle's generic sqlite-proxy driver instead — same schema/query
// builder API, just a thin sync-to-async adapter underneath.
const dataDir = path.join(process.cwd(), "data");
// data/ is gitignored (it holds the DB file, which shouldn't be committed),
// so it won't exist on a fresh clone/deploy — DatabaseSync doesn't create
// its parent directory itself.
mkdirSync(dataDir, { recursive: true });
// Overridable so throwaway scheduler/timezone test scripts can point at a
// disposable file instead of the real dev database (see scripts/test-*.ts).
const dbPath = process.env.CMS_DB_PATH ?? path.join(dataDir, "cms.db");
const sqlite = new DatabaseSync(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content_json TEXT NOT NULL,
    cover_image TEXT,
    category_id INTEGER REFERENCES categories(id),
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_at TEXT,
    scheduled_unpublish_at TEXT,
    published_at TEXT,
    unpublished_at TEXT,
    publish_attempts INTEGER NOT NULL DEFAULT 0,
    last_transition_error TEXT,
    last_transition_error_at TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp),
    deleted_at TEXT,
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eyebrow TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    image TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE TABLE IF NOT EXISTS post_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    event_type TEXT NOT NULL,
    detail TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_post_events_post_id ON post_events(post_id);

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    list_summary TEXT NOT NULL,
    hero_subheading TEXT NOT NULL,
    hero_intro TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    intro_lead TEXT NOT NULL,
    intro_detail TEXT NOT NULL,
    benefits_json TEXT NOT NULL,
    highlight_title TEXT NOT NULL,
    highlight_text TEXT NOT NULL,
    audience_description TEXT NOT NULL,
    audiences_json TEXT NOT NULL,
    credential_number TEXT,
    credential_text TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    "order" INTEGER NOT NULL DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_services_status_order ON services(status, "order");
`);

// A DB file created before this feature existed won't have the columns
// above (CREATE TABLE IF NOT EXISTS is a no-op on an existing table) — bring
// it up to date column-by-column. ADD COLUMN never touches existing row
// data, and SQLite has no "ADD COLUMN IF NOT EXISTS", so existence is
// checked manually via PRAGMA table_info first, making this idempotent on
// every boot.
const existingColumns = new Set(
  (sqlite.prepare("PRAGMA table_info(posts)").all() as { name: string }[]).map((c) => c.name),
);
const newPostColumns: Record<string, string> = {
  scheduled_at: "TEXT",
  scheduled_unpublish_at: "TEXT",
  unpublished_at: "TEXT",
  publish_attempts: "INTEGER NOT NULL DEFAULT 0",
  last_transition_error: "TEXT",
  last_transition_error_at: "TEXT",
};
for (const [column, ddlType] of Object.entries(newPostColumns)) {
  if (!existingColumns.has(column)) {
    sqlite.exec(`ALTER TABLE posts ADD COLUMN ${column} ${ddlType}`);
  }
}

sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_posts_status_scheduled_at ON posts(status, scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_posts_status_scheduled_unpublish_at ON posts(status, scheduled_unpublish_at);
`);

export const db = drizzle(
  async (sqlText, params, method) => {
    const stmt = sqlite.prepare(sqlText);
    if (method === "run") {
      stmt.run(...params);
      return { rows: [] };
    }

    const rows = stmt.all(...params).map((row: object) => Object.values(row));
    if (method === "get") {
      return { rows: rows[0] as unknown as [] };
    }
    return { rows };
  },
  { schema, casing: "snake_case" },
);
