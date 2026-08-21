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

  CREATE TABLE IF NOT EXISTS statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value INTEGER NOT NULL,
    prefix TEXT,
    suffix TEXT,
    label TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_statistics_active_order ON statistics(active, "order");

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_certifications_active_order ON certifications(active, "order");

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_clients_active_order ON clients(active, "order");

  CREATE TABLE IF NOT EXISTS institutional_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eyebrow TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp)
  );

  CREATE INDEX IF NOT EXISTS idx_institutional_content_active_order ON institutional_content(active, "order");
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

// banners predates the new single-message Hero (see docs/HOME_EXPERIENCE_BLUEPRINT.md
// §4 / docs/HOME_IMPLEMENTATION_READINESS.md §2) — these 3 columns are new on an
// already-existing table, so (unlike statistics/certifications/institutional_content,
// which are brand-new tables) they need the same idempotent ALTER TABLE upgrade
// pattern already used for `posts` above.
const existingBannerColumns = new Set(
  (sqlite.prepare("PRAGMA table_info(banners)").all() as { name: string }[]).map((c) => c.name),
);
const newBannerColumns: Record<string, string> = {
  mobile_image: "TEXT",
  cta_label: "TEXT",
  cta_href: "TEXT",
};
for (const [column, ddlType] of Object.entries(newBannerColumns)) {
  if (!existingBannerColumns.has(column)) {
    sqlite.exec(`ALTER TABLE banners ADD COLUMN ${column} ${ddlType}`);
  }
}

// institutional_content: `type`/`summary` added per
// docs/ABOUT_CONTENT_ARCHITECTURE.md §11 — same idempotent ADD COLUMN
// upgrade as banners above (this table already exists on any DB created
// before this change).
const existingInstitutionalColumns = new Set(
  (sqlite.prepare("PRAGMA table_info(institutional_content)").all() as { name: string }[]).map((c) => c.name),
);
const newInstitutionalColumns: Record<string, string> = {
  type: "TEXT",
  summary: "TEXT",
};
for (const [column, ddlType] of Object.entries(newInstitutionalColumns)) {
  if (!existingInstitutionalColumns.has(column)) {
    sqlite.exec(`ALTER TABLE institutional_content ADD COLUMN ${column} ${ddlType}`);
  }
}

// SQLite's ALTER TABLE ADD COLUMN can't attach a UNIQUE constraint directly
// (only a plain column with a constant default) — a UNIQUE index created
// separately is the standard SQLite way to retrofit that guarantee onto an
// existing table without a full rebuild. NULL is not subject to a unique
// index in SQLite (multiple NULLs are allowed), so rows with no `type` set
// are unaffected; at most one row per real type value (about/mission/
// vision/values/history) is enforced at the database layer — the same
// "1 registro por type" rule the admin form/action also check up front for
// a friendly error message (defense in depth, same two-layer pattern
// services.slug already uses).
sqlite.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_institutional_content_type ON institutional_content(type);
`);

// services: `intro_eyebrow`/`intro_title` added to make the "O Serviço"
// section heading per-service instead of hardcoded in ServiceView.tsx (it
// was previously the same string — "Um serviço pensado para a rotina do seu
// empreendimento" — on every service page regardless of which service).
// NOT NULL with a literal DEFAULT is safe here (unlike the nullable
// ALTER TABLE columns above): SQLite backfills every existing row with that
// exact default in the same statement, and that default IS the sentence
// already live on every service page today, so no visual change occurs
// until an admin edits the new fields.
const existingServiceColumns = new Set(
  (sqlite.prepare("PRAGMA table_info(services)").all() as { name: string }[]).map((c) => c.name),
);
if (!existingServiceColumns.has("intro_eyebrow")) {
  sqlite.exec(`ALTER TABLE services ADD COLUMN intro_eyebrow TEXT NOT NULL DEFAULT 'O Serviço'`);
}
if (!existingServiceColumns.has("intro_title")) {
  sqlite.exec(
    `ALTER TABLE services ADD COLUMN intro_title TEXT NOT NULL DEFAULT 'Um serviço pensado para a rotina do seu empreendimento'`,
  );
}

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
