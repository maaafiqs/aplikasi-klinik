import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff } from 'lucide-react';

const Profil = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    tanggal_lahir: '', nik: '', jenis_kelamin: 'Laki-laki', 
    jenis_pembayaran: 'Umum', no_kartu: '', alamat: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userId, setUserId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '',
      tanggal_lahir: user.tanggal_lahir || '',
      nik: user.nik || '',
      jenis_kelamin: user.jenis_kelamin || 'Laki-laki',
      jenis_pembayaran: user.jenis_pembayaran || 'Umum',
      no_kartu: user.no_kartu || '',
      alamat: user.alamat || ''
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        localStorage.setItem('user', JSON.stringify(data.user));
        // Kosongkan password setelah update sukses
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary-yellow-hover)' }}>
            <User size={48} />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Profil Pengguna</h2>
          <p style={{ color: 'var(--text-muted)' }}>Perbarui informasi akun Anda</p>
        </div>

        {message.text && (
          <div style={{ 
            backgroundColor: message.type === 'success' ? '#DEF7EC' : '#FEE2E2', 
            color: message.type === 'success' ? '#03543F' : '#DC2626', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem', 
            fontWeight: '500' 
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Alamat Lengkap</label>
            <textarea name="alamat" className="form-input" rows={3} value={formData.alamat} onChange={handleChange} required></textarea>
          </div>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
              <input type="text" name="nik" className="form-input" value={formData.nik} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" name="tanggal_lahir" className="form-input" value={formData.tanggal_lahir} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Jenis Kelamin</label>
              <select name="jenis_kelamin" className="form-select" value={formData.jenis_kelamin} onChange={handleChange}>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Jenis Pembayaran Asuransi</label>
              <select name="jenis_pembayaran" className="form-select" value={formData.jenis_pembayaran} onChange={handleChange}>
                <option value="Umum">Umum (Mandiri)</option>
                <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                <option value="Asuransi Lainnya">Asuransi Lainnya</option>
              </select>
            </div>
          </div>
          {formData.jenis_pembayaran !== 'Umum' && (
            <div className="form-group">
              <label className="form-label">Nomor Kartu ({formData.jenis_pembayaran})</label>
              <input type="text" name="no_kartu" className="form-input" value={formData.no_kartu} onChange={handleChange} />
            </div>
          )}
          <div className="form-group" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <label className="form-label">Password Baru (Opsional)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                className="form-input" 
                style={{ paddingRight: '2.75rem' }}
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Kosongkan jika tidak ingin mengubah password" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem',
                  color: 'var(--text-muted)'
                }}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profil;
