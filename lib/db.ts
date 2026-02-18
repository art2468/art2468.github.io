import Database from 'better-sqlite3';

export type User = { id: string; email: string; name: string | null; createdAt: string };
export type ProspectStatus = 'NEW' | 'QUALIFIED' | 'MESSAGED' | 'REPLIED' | 'CALL_BOOKED' | 'NOT_A_FIT' | 'PARKED';
export type Prospect = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  profileUrl: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  title: string | null;
  region: string | null;
  status: ProspectStatus;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  tags: string | null;
  rawAboutText: string;
  rawExperienceText: string;
  myNotes: string | null;
  aiCareerSummary: string | null;
  aiLikelyPriorities: string | null;
  aiFitScore: number | null;
  aiFitReason: string | null;
  aiBestAngle: string | null;
  aiPersonalNote: string | null;
  aiFollowUpQuestion: string | null;
  aiModel: string | null;
  aiRunAt: string | null;
};

export type Interaction = {
  id: string;
  prospectId: string;
  createdAt: string;
  type: string;
  channel: string;
  content: string;
  outcome: string | null;
};

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './outreachops.db';
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

let initialized = false;
function init() {
  if (initialized) return;
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      source TEXT NOT NULL DEFAULT 'LinkedIn',
      profileUrl TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      company TEXT,
      title TEXT,
      region TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      lastContactedAt TEXT,
      nextFollowUpAt TEXT,
      tags TEXT,
      rawAboutText TEXT NOT NULL,
      rawExperienceText TEXT NOT NULL,
      myNotes TEXT,
      aiCareerSummary TEXT,
      aiLikelyPriorities TEXT,
      aiFitScore INTEGER,
      aiFitReason TEXT,
      aiBestAngle TEXT,
      aiPersonalNote TEXT,
      aiFollowUpQuestion TEXT,
      aiModel TEXT,
      aiRunAt TEXT,
      UNIQUE(userId, profileUrl),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      prospectId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      type TEXT NOT NULL,
      channel TEXT NOT NULL,
      content TEXT NOT NULL,
      outcome TEXT,
      FOREIGN KEY (prospectId) REFERENCES prospects(id)
    );

    CREATE INDEX IF NOT EXISTS idx_prospects_user_updated ON prospects(userId, updatedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_prospects_user_status ON prospects(userId, status);
    CREATE INDEX IF NOT EXISTS idx_interactions_prospect_created ON interactions(prospectId, createdAt DESC);
  `);
  initialized = true;
}

init();

export function makeId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export const db = {
  getUserByEmail(email: string): User | undefined {
    return sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  upsertUser(email: string, name: string | null): User {
    const existing = db.getUserByEmail(email);
    if (existing) return existing;
    const id = makeId('usr');
    sqlite.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').run(id, email, name);
    return sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  },

  createProspect(data: Record<string, unknown>) {
    const id = makeId('pro');
    sqlite.prepare(`INSERT INTO prospects (
      id,userId,profileUrl,firstName,lastName,company,title,region,rawAboutText,rawExperienceText,myNotes,tags
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, data.userId, data.profileUrl, data.firstName, data.lastName, data.company, data.title, data.region,
      data.rawAboutText, data.rawExperienceText, data.myNotes, data.tags
    );
    return id;
  },

  getProspectByIdForUser(id: string, userId: string): Prospect | undefined {
    return sqlite.prepare('SELECT * FROM prospects WHERE id = ? AND userId = ?').get(id, userId) as Prospect | undefined;
  },

  listProspectsForUser(opts: { userId: string; q?: string; status?: string; fitMin?: number; fitMax?: number; sort?: string }) {
    const where: string[] = ['userId = ?'];
    const args: unknown[] = [opts.userId];
    if (opts.q) {
      where.push('(COALESCE(firstName,\'\') LIKE ? OR COALESCE(lastName,\'\') LIKE ? OR COALESCE(company,\'\') LIKE ? OR COALESCE(title,\'\') LIKE ? OR profileUrl LIKE ?)');
      for (let i = 0; i < 5; i++) args.push(`%${opts.q}%`);
    }
    if (opts.status) {
      where.push('status = ?');
      args.push(opts.status);
    }
    if (Number.isFinite(opts.fitMin as number)) {
      where.push('aiFitScore >= ?');
      args.push(opts.fitMin);
    }
    if (Number.isFinite(opts.fitMax as number)) {
      where.push('aiFitScore <= ?');
      args.push(opts.fitMax);
    }
    const orderBy = opts.sort === 'fit' ? 'aiFitScore DESC' : opts.sort === 'followup' ? 'nextFollowUpAt ASC' : 'updatedAt DESC';
    return sqlite.prepare(`SELECT * FROM prospects WHERE ${where.join(' AND ')} ORDER BY ${orderBy}`).all(...args) as Prospect[];
  },

  listInteractions(prospectId: string): Interaction[] {
    return sqlite.prepare('SELECT * FROM interactions WHERE prospectId = ? ORDER BY createdAt DESC').all(prospectId) as Interaction[];
  },

  updateProspect(id: string, patch: Record<string, unknown>) {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    const sql = `UPDATE prospects SET ${keys.map((k) => `${k} = ?`).join(', ')}, updatedAt = datetime('now') WHERE id = ?`;
    sqlite.prepare(sql).run(...keys.map((k) => patch[k]), id);
  },

  createInteraction(data: Record<string, unknown>) {
    const id = makeId('int');
    sqlite.prepare('INSERT INTO interactions (id, prospectId, type, channel, content, outcome) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, data.prospectId, data.type, data.channel, data.content, data.outcome);
    return id;
  },
};
