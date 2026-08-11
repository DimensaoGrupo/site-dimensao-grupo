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
const sqlite = new DatabaseSync(path.join(dataDir, "cms.db"));

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
    published_at TEXT,
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
