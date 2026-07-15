import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword, encrypt } from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'klinik.db');
const db = new Database(dbFile);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'patient',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    doctor_id INTEGER,
    nama_pasien TEXT NOT NULL,
    nik TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    alamat TEXT NOT NULL,
    poli_tujuan TEXT NOT NULL,
    tanggal_kunjungan DATE NOT NULL,
    jenis_pembayaran TEXT NOT NULL, -- BPJS atau Umum
    no_kartu TEXT,
    no_antrian TEXT,
    status TEXT DEFAULT 'Menunggu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    schedule TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Try to add new columns to existing tables if they were created before
try { db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN tanggal_lahir DATE`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN nik TEXT`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN jenis_kelamin TEXT DEFAULT 'Laki-laki'`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN jenis_pembayaran TEXT DEFAULT 'Umum'`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN no_kartu TEXT`); } catch (err) {}
try { db.exec(`ALTER TABLE users ADD COLUMN alamat TEXT`); } catch (err) {}

try { db.exec(`ALTER TABLE patients ADD COLUMN no_kartu TEXT`); } catch (err) {}
try { db.exec(`ALTER TABLE patients ADD COLUMN doctor_id INTEGER`); } catch (err) {}
try { db.exec(`ALTER TABLE patients ADD COLUMN no_antrian TEXT`); } catch (err) {}
try { db.exec(`ALTER TABLE patients ADD COLUMN status TEXT DEFAULT 'Menunggu'`); } catch (err) {}

try { db.exec(`ALTER TABLE doctors ADD COLUMN available_days TEXT`); } catch (err) {}

// Create an initial admin user if not exists
try {
  const adminExists = db.prepare("SELECT * FROM users WHERE email = 'admin@klinik.com'").get();
  if (!adminExists) {
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run('Admin Klinik', 'admin@klinik.com', hashPassword('admin123'), 'admin');
  }
} catch (err) {
  console.error("Failed to create admin:", err);
}

// Migrate existing data (hashing plaintext passwords & encrypting plaintext NIKs)
try {
  // 1. Migrate users table
  const users = db.prepare('SELECT id, password, nik FROM users').all();
  const updatePasswordStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  const updateNikStmt = db.prepare('UPDATE users SET nik = ? WHERE id = ?');
  
  for (const user of users) {
    // If password is not hashed, hash it
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const hashed = hashPassword(user.password);
      updatePasswordStmt.run(hashed, user.id);
      console.log(`Migrated password for user ID ${user.id}`);
    }
    // If NIK is plaintext, encrypt it
    if (user.nik && !user.nik.includes(':')) {
      const encrypted = encrypt(user.nik);
      updateNikStmt.run(encrypted, user.id);
      console.log(`Migrated NIK for user ID ${user.id}`);
    }
  }

  // 2. Migrate patients table
  const patients = db.prepare('SELECT id, nik FROM patients').all();
  const updatePatientNikStmt = db.prepare('UPDATE patients SET nik = ? WHERE id = ?');
  
  for (const patient of patients) {
    if (patient.nik && !patient.nik.includes(':')) {
      const encrypted = encrypt(patient.nik);
      updatePatientNikStmt.run(encrypted, patient.id);
      console.log(`Migrated NIK for patient ID ${patient.id}`);
    }
  }
} catch (err) {
  console.error("Data migration failed:", err);
}

export default db;
