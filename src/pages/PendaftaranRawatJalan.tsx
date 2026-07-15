import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

const PendaftaranRawatJalan = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [polis, setPolis] = useState<string[]>([]);
  const [selectedPoli, setSelectedPoli] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [userProfileNoKartu, setUserProfileNoKartu] = useState('');
  
  const [formData, setFormData] = useState({
    nama_pasien: '',
    nik: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    alamat: '',
    doctor_id: '',
    poli_tujuan: '',
    tanggal_kunjungan: '',
    jenis_pembayaran: 'Umum',
    no_kartu: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Periksa apakah user sudah login
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
      setFormData(prev => ({ 
        ...prev, 
        nama_pasien: user.name,
        nik: user.nik || '',
        tanggal_lahir: user.tanggal_lahir || '',
        jenis_kelamin: user.jenis_kelamin || 'Laki-laki',
        jenis_pembayaran: user.jenis_pembayaran || 'Umum',
        no_kartu: user.no_kartu || '',
        alamat: user.alamat || ''
      }));
      setUserProfileNoKartu(user.no_kartu || '');
    } else {
      // Boleh juga di redirect ke login, tapi untuk demo kita biarkan bisa tanpa login 
      // navigate('/login');
    }
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctors(data);
          const uniquePolis = Array.from(new Set(data.map((d: any) => d.specialty))) as string[];
          setPolis(uniquePolis);
          if (uniquePolis.length > 0) {
            setSelectedPoli(uniquePolis[0]);
            setFormData(prev => ({ ...prev, poli_tujuan: uniquePolis[0] }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'tanggal_kunjungan') {
      if (formData.doctor_id) {
        const doc = doctors.find(d => d.id.toString() === formData.doctor_id);
        if (doc && doc.available_days) {
          const dayIndex = new Date(value).getDay();
          const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const selectedDayName = daysMap[dayIndex];
          if (!doc.available_days.includes(selectedDayName)) {
            alert(`Dokter hanya tersedia pada hari: ${doc.available_days}. Silakan pilih tanggal lain.`);
            setFormData(prev => ({ ...prev, [name]: '' }));
            return;
          }
        }
      }
    }
    if (name === 'jenis_pembayaran') {
      if (value !== 'Umum') {
        setFormData(prev => ({ ...prev, [name]: value, no_kartu: userProfileNoKartu }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value, no_kartu: '' }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePoliChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poli = e.target.value;
    setSelectedPoli(poli);
    setDoctorSearch('');
    setFormData(prev => ({ ...prev, poli_tujuan: poli, doctor_id: '' }));
  };

  const filteredDoctors = doctors.filter(d => 
    d.specialty === selectedPoli && 
    d.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const payload = { ...formData, user_id: userId };
      const response = await fetch('http://localhost:3001/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Pendaftaran rawat jalan berhasil! Nomor Antrean Anda: ${data.no_antrian}. Silakan datang sesuai jadwal.` });
        // Reset form except user details
        setFormData(prev => ({
          ...prev,
          tanggal_kunjungan: '', doctor_id: '', poli_tujuan: polis[0] || ''
        }));
        setSelectedPoli(polis[0] || '');
        setDoctorSearch('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '1rem', color: 'var(--primary-yellow-hover)' }}>
            <CalendarPlus size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Form Pendaftaran Rawat Jalan</h2>
            <p style={{ color: 'var(--text-muted)' }}>Silakan lengkapi data berikut untuk mendaftar antrean.</p>
          </div>
        </div>

        {/* Custom Popup Modal */}
        {message.text && message.type === 'success' && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              animation: 'popIn 0.3s ease-out'
            }}>
              <div style={{ color: '#10B981', marginBottom: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>Pendaftaran Berhasil!</h3>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{message.text}</p>
              <button 
                onClick={() => {
                  setMessage({ type: '', text: '' });
                  navigate('/riwayat'); // Arahkan ke riwayat
                }}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Lihat Riwayat
              </button>
            </div>
            <style>{`
              @keyframes popIn {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Error message inline */}
        {message.text && message.type === 'error' && (
          <div style={{ 
            backgroundColor: '#FEE2E2', 
            color: '#DC2626', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem', 
            fontWeight: '500' 
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid-cols-2">
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-yellow-hover)' }}>Data Pasien</h3>
              <button type="button" onClick={() => navigate('/profil')} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                Edit Data Diri
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Data diri otomatis diambil dari profil Anda dan tidak dapat diubah di halaman ini.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Pasien</label>
            <input type="text" name="nama_pasien" className="form-input" value={formData.nama_pasien} disabled style={{ backgroundColor: '#f3f4f6' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Induk Kependudukan (NIK)</label>
            <input type="text" name="nik" className="form-input" value={formData.nik} disabled style={{ backgroundColor: '#f3f4f6' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" className="form-input" value={formData.tanggal_lahir} disabled style={{ backgroundColor: '#f3f4f6' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Jenis Kelamin</label>
            <select name="jenis_kelamin" className="form-select" value={formData.jenis_kelamin} disabled style={{ backgroundColor: '#f3f4f6' }}>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Alamat Lengkap</label>
            <textarea name="alamat" className="form-input" rows={3} value={formData.alamat} disabled style={{ backgroundColor: '#f3f4f6' }}></textarea>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-yellow-hover)' }}>Data Kunjungan</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Pilih Poli Tujuan</label>
            <select className="form-select" value={selectedPoli} onChange={handlePoliChange} required>
              {polis.map(poli => (
                <option key={poli} value={poli}>{poli}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pilih Dokter (Ketik nama untuk mencari)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Cari dokter..."
                value={doctorSearch}
                onChange={(e) => {
                  setDoctorSearch(e.target.value);
                  setShowDoctorDropdown(true);
                  if (formData.doctor_id) {
                    setFormData(prev => ({ ...prev, doctor_id: '' }));
                  }
                }}
                onFocus={() => setShowDoctorDropdown(true)}
                onBlur={() => setTimeout(() => setShowDoctorDropdown(false), 200)}
                required={!formData.doctor_id}
              />
              {showDoctorDropdown && (
                <ul style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  backgroundColor: '#fff', border: '1px solid var(--border-color)', 
                  borderRadius: '0.5rem', maxHeight: '200px', overflowY: 'auto', 
                  zIndex: 10, listStyle: 'none', padding: 0, margin: '0.25rem 0 0 0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {filteredDoctors.length > 0 ? filteredDoctors.map(d => (
                    <li 
                      key={d.id} 
                      style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, doctor_id: d.id.toString(), tanggal_kunjungan: '' }));
                        setDoctorSearch(d.name);
                        setShowDoctorDropdown(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <div style={{ fontWeight: '600' }}>{d.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{d.schedule}</div>
                    </li>
                  )) : (
                    <li style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Dokter tidak ditemukan</li>
                  )}
                </ul>
              )}
            </div>
            {formData.doctor_id && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10B981' }}>✓ Dokter terpilih</div>}
            {doctors.length === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '0.25rem' }}>Belum ada jadwal dokter tersedia di poli ini</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Kunjungan</label>
            <input type="date" name="tanggal_kunjungan" className="form-input" value={formData.tanggal_kunjungan} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Jenis Pembayaran</label>
            <select name="jenis_pembayaran" className="form-select" value={formData.jenis_pembayaran} onChange={handleChange} required>
              <option value="Umum">Umum (Mandiri)</option>
              <option value="BPJS Kesehatan">BPJS Kesehatan</option>
              <option value="Asuransi Lainnya">Asuransi Lainnya</option>
            </select>
          </div>

          {formData.jenis_pembayaran !== 'Umum' && (
            <div className="form-group">
              <label className="form-label">Nomor Kartu {formData.jenis_pembayaran}</label>
              <input type="text" name="no_kartu" className="form-input" value={formData.no_kartu} onChange={handleChange} placeholder="Masukkan nomor kartu" required />
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.125rem', padding: '1rem' }}>
              Konfirmasi Pendaftaran
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PendaftaranRawatJalan;
