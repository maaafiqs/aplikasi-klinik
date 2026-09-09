import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import { hashPassword, comparePassword, encrypt, decrypt } from './security.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Authentication Routes ---

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hashPassword(password));
    res.status(201).json({ id: result.lastInsertRowid, message: 'User registered successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (user && comparePassword(password, user.password)) {
      // In a real app, use JWT here. For simplicity we just return user details
      res.json({ message: 'Login successful', user: { 
        id: user.id, name: user.name, email: user.email, role: user.role,
        tanggal_lahir: user.tanggal_lahir, nik: decrypt(user.nik), jenis_kelamin: user.jenis_kelamin, 
        jenis_pembayaran: user.jenis_pembayaran, no_kartu: user.no_kartu, alamat: user.alamat
      } });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update User Profile
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, tanggal_lahir, nik, jenis_kelamin, jenis_pembayaran, no_kartu, alamat } = req.body;
  
  try {
    let stmt;
    const secureNik = nik ? encrypt(nik) : null;
    if (password) {
      stmt = db.prepare('UPDATE users SET name = ?, email = ?, password = ?, tanggal_lahir = ?, nik = ?, jenis_kelamin = ?, jenis_pembayaran = ?, no_kartu = ?, alamat = ? WHERE id = ?');
      stmt.run(name, email, hashPassword(password), tanggal_lahir || null, secureNik, jenis_kelamin || 'Laki-laki', jenis_pembayaran || 'Umum', no_kartu || null, alamat || null, id);
    } else {
      stmt = db.prepare('UPDATE users SET name = ?, email = ?, tanggal_lahir = ?, nik = ?, jenis_kelamin = ?, jenis_pembayaran = ?, no_kartu = ?, alamat = ? WHERE id = ?');
      stmt.run(name, email, tanggal_lahir || null, secureNik, jenis_kelamin || 'Laki-laki', jenis_pembayaran || 'Umum', no_kartu || null, alamat || null, id);
    }
    
    const updatedUser = db.prepare('SELECT id, name, email, role, tanggal_lahir, nik, jenis_kelamin, jenis_pembayaran, no_kartu, alamat FROM users WHERE id = ?').get(id);
    if (updatedUser) {
      updatedUser.nik = decrypt(updatedUser.nik);
    }
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add Admin User
app.post('/api/users/admin', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, email, hashPassword(password), 'admin');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Admin added successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Outpatient Registration (Pendaftaran Rawat Jalan) Routes ---

// Register new patient
app.post('/api/patients', (req, res) => {
  const { user_id, doctor_id, nama_pasien, nik, tanggal_lahir, jenis_kelamin, alamat, poli_tujuan, tanggal_kunjungan, jenis_pembayaran, no_kartu } = req.body;
  
  if (!nama_pasien || !nik || !poli_tujuan || !tanggal_kunjungan || !jenis_pembayaran || !doctor_id) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    // Generate nomor antrean berdasarkan tanggal kunjungan dan poli
    // Format misal: U-001 (Umum), G-001 (Gigi)
    const prefix = poli_tujuan.charAt(5).toUpperCase(); // 'Poli Umum' -> 'U'
    
    const countQuery = db.prepare('SELECT COUNT(*) as count FROM patients WHERE tanggal_kunjungan = ? AND poli_tujuan = ?').get(tanggal_kunjungan, poli_tujuan);
    const nextNumber = countQuery.count + 1;
    const no_antrian = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO patients (
        user_id, doctor_id, nama_pasien, nik, tanggal_lahir, jenis_kelamin, 
        alamat, poli_tujuan, tanggal_kunjungan, jenis_pembayaran, no_kartu, no_antrian
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      user_id || null, doctor_id, nama_pasien, encrypt(nik), tanggal_lahir, jenis_kelamin, 
      alamat, poli_tujuan, tanggal_kunjungan, jenis_pembayaran, no_kartu || null, no_antrian
    );
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Registration successful', no_antrian });
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get all patient registrations (for admin)
app.get('/api/patients', (req, res) => {
  try {
    // Join with doctors to get doctor name
    const patients = db.prepare(`
      SELECT p.*, d.name as doctor_name 
      FROM patients p 
      LEFT JOIN doctors d ON p.doctor_id = d.id 
      ORDER BY p.created_at DESC
    `).all();
    const decryptedPatients = patients.map(p => ({
      ...p,
      nik: decrypt(p.nik)
    }));
    res.json(decryptedPatients);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update patient status
app.put('/api/patients/:id/status', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE patients SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get patient history by user_id
app.get('/api/patients/history/:userId', (req, res) => {
  try {
    const patients = db.prepare(`
      SELECT p.*, d.name as doctor_name 
      FROM patients p 
      LEFT JOIN doctors d ON p.doctor_id = d.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
    `).all(req.params.userId);
    const decryptedPatients = patients.map(p => ({
      ...p,
      nik: decrypt(p.nik)
    }));
    res.json(decryptedPatients);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Doctors Routes ---

// Get all doctors
app.get('/api/doctors', (req, res) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors ORDER BY name ASC').all();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add a doctor
app.post('/api/doctors', (req, res) => {
  const { name, specialty, schedule, available_days } = req.body;
  if (!name || !specialty || !schedule) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const stmt = db.prepare('INSERT INTO doctors (name, specialty, schedule, available_days) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, specialty, schedule, available_days || null);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Doctor added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a doctor
app.delete('/api/doctors/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get active queues for marquee
app.get('/api/queues/active', (req, res) => {
  try {
    // Return currently running queues (Diperiksa) and up to 5 waiting queues (Menunggu) today
    const running = db.prepare('SELECT no_antrian, poli_tujuan, status FROM patients WHERE status = "Diperiksa" AND date(created_at) = date("now")').all();
    const waiting = db.prepare('SELECT no_antrian, poli_tujuan, status FROM patients WHERE status = "Menunggu" AND date(created_at) = date("now") ORDER BY created_at ASC LIMIT 5').all();
    res.json({ running, waiting });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
