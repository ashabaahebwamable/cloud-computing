import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DATABASE_URL
  ? path.resolve(process.env.DATABASE_URL)
  : path.join(__dirname, '..', 'neurox.db');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`PRAGMA journal_mode = WAL;`);
  await initSchema(dbInstance);
  await seedUsers(dbInstance);

  return dbInstance;
}

async function initSchema(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Radiologist', 'Doctor', 'Anesthesiologist'))
    );

    CREATE TABLE IF NOT EXISTS Shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_time DATETIME NOT NULL,
      logout_time DATETIME,
      cases_handled INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uploaded_by INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      image_path TEXT,
      mask_path TEXT,
      findings TEXT,
      confidence REAL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'transferred', 'reviewed', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS CaseTransfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      sent_by INTEGER NOT NULL,
      sent_to INTEGER NOT NULL,
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES Cases(id),
      FOREIGN KEY (sent_by) REFERENCES Users(id),
      FOREIGN KEY (sent_to) REFERENCES Users(id)
    );
  `);
}

async function seedUsers(db: Database): Promise<void> {
  const { count } = (await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM Users'
  )) ?? { count: 0 };

  if (count === 0) {
    const hashed = await bcrypt.hash('password123', 10);
    const seeds = [
      { name: 'Dr. Alice', email: 'radiologist@neurox.com', role: 'Radiologist' },
      { name: 'Dr. Bob', email: 'doctor@neurox.com', role: 'Doctor' },
      { name: 'Dr. Charlie', email: 'anesthesiologist@neurox.com', role: 'Anesthesiologist' },
    ];
    for (const u of seeds) {
      await db.run(
        'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [u.name, u.email, hashed, u.role]
      );
    }
    console.log('[DB] Seeded 3 default users.');
  }
}

// Allow running directly: tsx server/db.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  getDb()
    .then(() => {
      console.log('[DB] Database initialized successfully at:', DB_PATH);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB] Initialization failed:', err);
      process.exit(1);
    });
}
