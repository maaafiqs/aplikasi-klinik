import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Riwayat = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      try {
        const response = await fetch(`${API_BASE_URL}/patients/history/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const filteredHistory = history.filter(item => {
    const matchSearch = 
      (item.poli_tujuan && item.poli_tujuan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nama_pasien && item.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.no_antrian && item.no_antrian.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.doctor_name && item.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '1rem', color: 'var(--primary-yellow-hover)' }}>
            <Clock size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Riwayat Pendaftaran</h2>
            <p style={{ color: 'var(--text-muted)' }}>Daftar riwayat kunjungan rawat jalan Anda.</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Cari poli, dokter, no. antrean..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            {['Semua', 'Menunggu', 'Diperiksa', 'Selesai'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '9999px',
                  border: filterStatus === status ? '1px solid var(--primary-yellow-hover)' : '1px solid var(--border-color)',
                  backgroundColor: filterStatus === status ? 'rgba(251, 191, 36, 0.15)' : '#fff',
                  color: filterStatus === status ? 'var(--primary-yellow-hover)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Tidak ada riwayat pendaftaran yang cocok.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredHistory.map((item, index) => (
              <div key={index} style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-color)' }}>
                      {item.no_antrian ? `[${item.no_antrian}] ` : ''}{item.poli_tujuan}
                    </h3>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: '600',
                      backgroundColor: item.status === 'Selesai' ? '#DEF7EC' : item.status === 'Diperiksa' ? '#E1EFFE' : '#FEF3C7',
                      color: item.status === 'Selesai' ? '#03543F' : item.status === 'Diperiksa' ? '#1E429F' : '#92400E'
                    }}>
                      {item.status || 'Menunggu'}
                    </span>
                  </div>
                  <span style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: 'var(--primary-yellow-hover)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                    {item.jenis_pembayaran}
                  </span>
                </div>
                <div className="grid-cols-2" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div><strong>Nama Pasien:</strong> {item.nama_pasien}</div>
                  <div><strong>Dokter:</strong> {item.doctor_name || 'Tidak ada'}</div>
                  <div><strong>Tanggal Kunjungan:</strong> {new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID')}</div>
                  <div><strong>NIK:</strong> {item.nik}</div>
                  {item.no_kartu && <div><strong>No. Kartu:</strong> {item.no_kartu}</div>}
                  <div style={{ gridColumn: '1 / -1' }}><strong>Alamat:</strong> {item.alamat}</div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', fontSize: '0.75rem' }}>Didaftarkan pada: {new Date(item.created_at).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Riwayat;
