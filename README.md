# 🏥 Aplikasi Klinik Sehat - Sistem Pendaftaran Rawat Jalan & Antrean Online

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Security](https://img.shields.io/badge/Security-AES--256--CBC%20%2B%20Bcrypt-critical)](https://github.com/maaafiqs/aplikasi-klinik)

Sistem Informasi Manajemen Pelayanan Klinik modern berbasis Web yang dirancang untuk mempermudah pendaftaran pasien rawat jalan secara online, penomoran antrean otomatis per poli, pemantauan antrean *real-time*, hingga pengelolaan rekam operasional klinik oleh administrator.

---

## 🌟 Fitur Utama

### 👥 Pasien & Publik
1. **Pendaftaran Akun & Autentikasi**:
   - Pembuatan akun pasien baru dengan validasi data email dan konfirmasi password.
   - Login terproteksi untuk mengakses riwayat dan layanan pendaftaran.
2. **Pendaftaran Rawat Jalan Mandiri**:
   - Pilihan poli tujuan (Poli Umum, Poli Gigi, Poli Anak, Poli Mata, dll.).
   - Pilihan dokter spesialis yang praktek sesuai jadwal & hari operasional.
   - Pilihan metode pembayaran: **BPJS Kesehatan** atau **Umum / Mandiri**.
   - Pembuatan **Nomor Antrean Otomatis** (misal: `U-001`, `G-002`).
3. **Live Running Marquee Antrean**:
   - Menampilkan status antrean yang sedang diperiksa dan antrean berikutnya langsung pada halaman utama secara *real-time*.
4. **Riwayat Kunjungan Pasien**:
   - Pasien dapat memantau status pemeriksaan (`Menunggu`, `Diperiksa`, `Selesai`, `Dibatalkan`).
5. **Manajemen Profil Pasien**:
   - Pengaturan identitas pribadi, tanggal lahir, jenis kelamin, NIK, nomor BPJS, dan alamat domisili.

### 🛡️ Administrator Klinik
1. **Dashboard Operasional**:
   - Statistik total pendaftaran, dokter aktif, dan antrean aktif hari ini.
2. **Manajemen Antrean Pasien**:
   - Filter dan perbarui status pasien secara instan (`Diperiksa`, `Selesai`, `Batal`).
   - Fitur **Panggil Antrean** dengan notifikasi audio.
3. **Manajemen Jadwal Dokter**:
   - Tambah dokter baru, spesialisasi, jam praktek, dan hari kerja.
   - Hapus data dokter non-aktif.
4. **Manajemen Akun Admin**:
   - Tambah akun admin baru untuk petugas klinik.

---

## 🔒 Keamanan Data Pasien

Aplikasi ini menerapkan standar perlindungan data pribadi kesehatan (*Personal Health Information*):
* **Bcrypt Password Hashing**: Setiap kata sandi pengguna di-hash menggunakan algoritma Bcrypt (10 salt rounds) sebelum disimpan ke basis data.
* **AES-256-CBC NIK Encryption**: Nomor Induk Kependudukan (NIK) 16 digit pasien dienkripsi secara simetris menggunakan AES-256-CBC dengan *Initialization Vector* (IV) unik per entri data, melindungi data identitas dari kebocoran database.

---

## 🛠️ Arsitektur & Teknologi

* **Frontend**: React 18, TypeScript, Vite, React Router DOM v7, Lucide Icons, Vanilla Modern CSS.
* **Backend**: Node.js, Express.js 5.
* **Database**: SQLite3 via `better-sqlite3` (cepat, andal, tanpa konfigurasi server DB eksternal).
* **Reverse Proxy**: Vite Dev Server Proxy mengarahkan `/api` ke Backend `http://localhost:3001`.

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
* [Node.js](https://nodejs.org/) versi 18 ke atas
* [Git](https://git-scm.com/)

### 2. Kloning Repositori
```bash
git clone https://github.com/maaafiqs/aplikasi-klinik.git
cd aplikasi-klinik
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Aplikasi
Cukup jalankan satu perintah:
```bash
npm run dev
```

Script runner otomatis akan menyalakan kedua server secara bersamaan:
* **Express Backend**: `http://localhost:3001`
* **Vite Frontend**: `http://localhost:5173` (atau port yang dialokasikan)

Buka peramban Anda di: **`http://localhost:5173`**

---

## 🔑 Akun Demo Pengujian

| Peran | Email | Password | Keterangan |
|---|---|---|---|
| **Admin Klinik** | `admin@klinik.com` | `admin123` | Akses penuh dashboard admin & antrean |
| **Pasien Demo** | `syarif@gmail.com` | `syarif123` | Akun pasien terdaftar untuk tes |

---

## 📡 Dokumentasi Endpoint REST API

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/register` | Pendaftaran akun pasien baru |
| `POST` | `/api/login` | Otentikasi pasien & admin |
| `GET` | `/api/users` | Mendapatkan daftar seluruh akun (Admin) |
| `POST` | `/api/users/admin` | Menambahkan admin baru |
| `PUT` | `/api/users/:id` | Memperbarui profil pasien |
| `DELETE` | `/api/users/:id` | Menghapus akun pengguna |
| `GET` | `/api/doctors` | Mengambil data seluruh dokter aktif |
| `POST` | `/api/doctors` | Menambah data dokter dan jadwal praktek |
| `DELETE` | `/api/doctors/:id` | Menghapus data dokter |
| `POST` | `/api/patients` | Pendaftaran rawat jalan baru & generate antrean |
| `GET` | `/api/patients` | Mengambil semua antrean pasien (Admin) |
| `GET` | `/api/patients/history/:userId` | Mengambil riwayat kunjungan pasien berdasarkan ID |
| `PUT` | `/api/patients/:id/status` | Mengubah status antrean pasien |
| `GET` | `/api/queues/active` | Mengambil antrean berjalan & antrean tunggu aktif |

---

## 📁 Struktur Direktori Proyek

```text
aplikasi-klinik/
├── .env.example          # Template konfigurasi environment variable
├── dev.js                # Concurrent runner untuk backend & frontend
├── package.json          # Manifest dependensi & script runner
├── vite.config.ts        # Konfigurasi Vite & reverse proxy /api
├── server/
│   ├── db.js             # Inisialisasi SQLite database & migrasi otomatis
│   ├── index.js          # Express server & REST API endpoints
│   ├── security.js       # Hashing password (Bcrypt) & enkripsi NIK (AES-256)
│   └── klinik.db         # Database SQLite lokal (di-ignore git)
└── src/
    ├── config/           # Konfigurasi URL API terpusat
    ├── components/       # Komponen UI (Navbar, Toast, dll.)
    ├── pages/            # Halaman (Home, Login, Register, Pendaftaran, dll.)
    ├── services/         # Layer pemanggilan API (auth, patient, doctor, queue)
    ├── types/            # Definisi TypeScript interface
    └── utils/            # Utilitas helper (Audio Chime synthesizer)
```

---

## 📋 Perintah Script NPM

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan backend server (port 3001) dan frontend Vite (port 5173) bersamaan |
| `npm run server` | Menjalankan hanya backend Express dengan `--watch` |
| `npm run dev:client` | Menjalankan hanya frontend Vite |
| `npm run build` | Melakukan compile TypeScript (`tsc`) & bundle produksi Vite |
| `npm run preview` | Meninjau hasil build produksi secara lokal |

---

## 🗺️ Roadmap Pengembangan Selanjutnya
- [x] Otomasi runner backend + frontend dalam satu perintah
- [x] Enkripsi NIK Pasien (AES-256-CBC) & Bcrypt Password Hashing
- [x] Cetak Tiket Antrean Fisik / PDF
- [x] Notifikasi Audio Chime pada pemanggilan antrean di dashboard admin
- [x] Pencarian & filter riwayat kunjungan pasien
- [ ] Export laporan antrean ke format Excel/CSV untuk rekam medis klinik
- [ ] Integrasi WhatsApp Gateway untuk pengingat jadwal antrean pasien

---

## 📜 Lisensi
Dikembangkan untuk kebutuhan pelayanan kesehatan masyarakat. Lisensi Open-Source MIT.

