export type UserRole = 'patient' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  tanggal_lahir?: string;
  nik?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  jenis_pembayaran?: 'Umum' | 'BPJS';
  no_kartu?: string;
  alamat?: string;
  created_at?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  schedule: string;
  available_days?: string;
  created_at?: string;
}

export type QueueStatus = 'Menunggu' | 'Diperiksa' | 'Selesai' | 'Batal';

export interface Patient {
  id: number;
  user_id?: number | null;
  doctor_id: number;
  doctor_name?: string;
  nama_pasien: string;
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  poli_tujuan: string;
  tanggal_kunjungan: string;
  jenis_pembayaran: string;
  no_kartu?: string | null;
  no_antrian: string;
  status: QueueStatus;
  created_at?: string;
}

export interface ActiveQueueItem {
  no_antrian: string;
  poli_tujuan: string;
  status: QueueStatus;
}

export interface ActiveQueuesData {
  running: ActiveQueueItem[];
  waiting: ActiveQueueItem[];
}
