import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new Database(join(__dirname, 'dofus.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id             TEXT PRIMARY KEY,
    name           TEXT,
    patch          TEXT NOT NULL,
    role_tank      TEXT,
    role_soutien   TEXT NOT NULL,
    role_dpt       TEXT NOT NULL,
    role_dpt2      TEXT NOT NULL,
    auto_score     REAL NOT NULL DEFAULT 0,
    user_ratings   TEXT NOT NULL DEFAULT '[]',
    comment_desc   TEXT NOT NULL DEFAULT '',
    comment_str    TEXT NOT NULL DEFAULT '',
    comment_weak   TEXT NOT NULL DEFAULT '',
    is_recommended INTEGER NOT NULL DEFAULT 0,
    created_at     INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS classes_override (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS class_ratings (
    id         TEXT PRIMARY KEY,
    class_id   TEXT NOT NULL,
    stats      TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

// ─── Seed settings ────────────────────────────────────────────────────────────

db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin1234')`).run();

// ─── Seed default recommended teams ──────────────────────────────────────────

const recommendedCount = (db.prepare(`SELECT COUNT(*) as c FROM teams WHERE is_recommended = 1`).get() as { c: number }).c;

if (recommendedCount === 0) {
  try {
    const jsonPath = join(__dirname, '..', 'public', 'data', 'defaultTeams.json');
    const defaults = JSON.parse(readFileSync(jsonPath, 'utf-8')) as Array<{
      id: string;
      name?: string;
      patch: string;
      roles: { tank: string | null; soutienPolyvalent: string; dpt: string; dpt2: string };
      autoScore: number;
      userRatings: number[];
      comment: { description: string; strengths: string; weaknesses: string };
      createdAt: number;
    }>;

    const insert = db.prepare(`
      INSERT OR IGNORE INTO teams
        (id, name, patch, role_tank, role_soutien, role_dpt, role_dpt2, auto_score, user_ratings, comment_desc, comment_str, comment_weak, is_recommended, created_at)
      VALUES
        (@id, @name, @patch, @role_tank, @role_soutien, @role_dpt, @role_dpt2, @auto_score, @user_ratings, @comment_desc, @comment_str, @comment_weak, 1, @created_at)
    `);

    const insertMany = db.transaction((teams: typeof defaults) => {
      for (const t of teams) {
        insert.run({
          id: t.id,
          name: t.name ?? null,
          patch: t.patch,
          role_tank: t.roles.tank,
          role_soutien: t.roles.soutienPolyvalent,
          role_dpt: t.roles.dpt,
          role_dpt2: t.roles.dpt2,
          auto_score: t.autoScore,
          user_ratings: JSON.stringify(t.userRatings ?? []),
          comment_desc: t.comment.description,
          comment_str: t.comment.strengths,
          comment_weak: t.comment.weaknesses,
          created_at: t.createdAt,
        });
      }
    });

    insertMany(defaults);
    console.log(`[db] Seeded ${defaults.length} default recommended teams`);
  } catch (err) {
    console.warn('[db] Could not seed default teams:', err);
  }
}

export default db;
