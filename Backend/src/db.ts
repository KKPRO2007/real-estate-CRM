import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = new Database(path.join(__dirname, '../../crm.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    budget REAL,
    source TEXT,
    status TEXT DEFAULT 'new',
    assigned_to INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT,
    location TEXT,
    price REAL,
    size REAL,
    amenities TEXT,
    status TEXT DEFAULT 'available',
    assigned_agent INTEGER,
    images TEXT,
    lat REAL,
    lng REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_agent) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type TEXT DEFAULT 'buyer',
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    client_id INTEGER,
    property_id INTEGER,
    agent_id INTEGER,
    stage TEXT DEFAULT 'inquiry',
    value REAL,
    commission REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (agent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    client_id INTEGER,
    type TEXT,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    deal_id INTEGER,
    agent_id INTEGER,
    message TEXT,
    due_at DATETIME,
    done INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (agent_id) REFERENCES users(id)
  );
`)

const defaultAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@demo.local'
const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD || '123test'
const defaultAdminName = process.env.SEED_ADMIN_NAME || 'Admin'
const defaultGuestEmail = process.env.SEED_GUEST_EMAIL || 'guest@shared.local'
const defaultGuestName = process.env.SEED_GUEST_NAME || 'Guest'

const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultAdminEmail)
const existingGuest = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultGuestEmail)

if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync(defaultAdminPassword, 10)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    defaultAdminName,
    defaultAdminEmail,
    passwordHash,
    'admin',
  )
}

if (!existingGuest) {
  const passwordHash = bcrypt.hashSync(defaultAdminPassword, 10)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    defaultGuestName,
    defaultGuestEmail,
    passwordHash,
    'guest',
  )
}

export default db
