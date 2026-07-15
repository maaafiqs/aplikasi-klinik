import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Stethoscope, Trash2, Plus, Volume2, UserCog } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pasien');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Doctor form state
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Poli Umum');
  const [docDays, setDocDays] = useState<string[]>([]);
  const [docTimeStart, setDocTimeStart] = useState('');
  const [docTimeEnd, setDocTimeEnd] = useState('');

  const daysOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // User form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, doctorsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/patients'),
        fetch('http://localhost:3001/api/doctors'),
        fetch('http://localhost:3001/api/users')
      ]);
      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (docDays.length === 0) {
      alert('Pilih minimal satu hari praktek!');
      return;
    }
    try {
      // Construct schedule string
      const scheduleString = `${docDays.join(', ')} (${docTimeStart} - ${docTimeEnd})`;
      const availableDaysStr = docDays.join(',');
      
      const res = await fetch('http://localhost:3001/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: docName, specialty: docSpecialty, schedule: scheduleString, available_days: availableDaysStr })
      });
      if (res.ok) {
        setDocName('');
        setDocSpecialty('');
        setDocDays([]);
        setDocTimeStart('');
        setDocTimeEnd('');
        fetchData(); // refresh list
      }
    } catch (error) {
      console.error('Failed to add doctor', error);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus dokter ini?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete doctor', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, playSound: boolean = false) => {
    try {
      const res = await fetch(`http://localhost:3001/api/patients/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (playSound && audioRef.current) {
          audioRef.current.play().catch(e => console.error('Audio play failed', e));
        }
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/users/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword })
      });
      if (res.ok) {
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        fetchData();
      } else {
        alert('Gagal menambah admin. Email mungkin sudah terpakai.');
      }
    } catch (error) {
      console.error('Failed to add admin', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Admin Data...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Audio element for queue calling */}
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/ding_dong.ogg" preload="auto"></audio>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '1rem', color: 'var(--primary-yellow-hover)' }}>
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Kelola data klinik, pasien, dan dokter.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('pasien')}
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'pasien' ? 'var(--primary-yellow-hover)' : 'transparent',
            color: activeTab === 'pasien' ? '#fff' : 'var(--text-color)',
            border: '1px solid var(--primary-yellow-hover)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Users size={18} /> Antrean Pasien
        </button>
        <button 
          onClick={() => setActiveTab('dokter')}
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'dokter' ? 'var(--primary-yellow-hover)' : 'transparent',
            color: activeTab === 'dokter' ? '#fff' : 'var(--text-color)',
            border: '1px solid var(--primary-yellow-hover)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Stethoscope size={18} /> Kelola Dokter
        </button>
        <button 
          onClick={() => setActiveTab('pengguna')}
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'pengguna' ? 'var(--primary-yellow-hover)' : 'transparent',
            color: activeTab === 'pengguna' ? '#fff' : 'var(--text-color)',
            border: '1px solid var(--primary-yellow-hover)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <UserCog size={18} /> Kelola Pengguna
        </button>
      </div>

      <div className="card">
        {activeTab === 'pasien' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Daftar Antrean & Pendaftaran</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>No. Antrean</th>
                    <th style={{ padding: '1rem' }}>Pasien</th>
                    <th style={{ padding: '1rem' }}>Poli & Dokter</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Belum ada data pendaftaran</td></tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.125rem' }}>{p.no_antrian || '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '500' }}>{p.nama_pasien}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.jenis_pembayaran}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div>{p.poli_tujuan}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--primary-yellow-hover)' }}>{p.doctor_name || 'Tidak ada'}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem',
                            backgroundColor: p.status === 'Selesai' ? '#DEF7EC' : p.status === 'Diperiksa' ? '#E1EFFE' : '#FEF3C7',
                            color: p.status === 'Selesai' ? '#03543F' : p.status === 'Diperiksa' ? '#1E429F' : '#92400E'
                          }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {p.status === 'Menunggu' && (
                            <button onClick={() => handleUpdateStatus(p.id, 'Diperiksa', true)} className="btn btn-primary" style={{ padding: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              <Volume2 size={16} /> Panggil
                            </button>
                          )}
                          {p.status === 'Diperiksa' && (
                            <button onClick={() => handleUpdateStatus(p.id, 'Selesai')} className="btn" style={{ padding: '0.5rem', backgroundColor: '#10B981', color: 'white' }}>
                              Selesai
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dokter' && (
          <div className="grid-cols-1-2">
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Tambah Dokter</h3>
              <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Dokter</label>
                  <input type="text" className="form-input" value={docName} onChange={e => setDocName(e.target.value)} required placeholder="Misal: dr. Budi Santoso" />
                </div>
                <div className="form-group">
                  <label className="form-label">Spesialis</label>
                  <select className="form-select" value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)} required>
                    <option value="Poli Umum">Poli Umum</option>
                    <option value="Poli Gigi">Poli Gigi</option>
                    <option value="Poli Anak">Poli Anak</option>
                    <option value="Poli Kandungan">Poli Kandungan</option>
                    <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                    <option value="Poli Mata">Poli Mata</option>
                    <option value="Poli THT">Poli THT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hari Praktek</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {daysOptions.map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <input 
                          type="checkbox" 
                          checked={docDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) setDocDays([...docDays, day]);
                            else setDocDays(docDays.filter(d => d !== day));
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Jam Mulai</label>
                    <input type="time" className="form-input" value={docTimeStart} onChange={e => setDocTimeStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam Selesai</label>
                    <input type="time" className="form-input" value={docTimeEnd} onChange={e => setDocTimeEnd(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} /> Tambah Data
                </button>
              </form>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Daftar Dokter</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {doctors.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                    Belum ada data dokter.
                  </div>
                ) : (
                  doctors.map((d) => (
                    <div key={d.id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{d.name}</div>
                        <div style={{ color: 'var(--primary-yellow-hover)', fontWeight: '500', fontSize: '0.875rem' }}>{d.specialty}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Jadwal: {d.schedule}</div>
                      </div>
                      <button onClick={() => handleDeleteDoctor(d.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }} title="Hapus">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pengguna' && (
          <div className="grid-cols-1-2">
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Tambah Admin Baru</h3>
              <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-input" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} /> Tambah Admin
                </button>
              </form>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Daftar Pengguna</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem' }}>Nama</th>
                      <th style={{ padding: '1rem' }}>Email</th>
                      <th style={{ padding: '1rem' }}>Role</th>
                      <th style={{ padding: '1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>{u.name}</td>
                        <td style={{ padding: '1rem' }}>{u.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem',
                            backgroundColor: u.role === 'admin' ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-color)',
                            color: u.role === 'admin' ? 'var(--primary-yellow-hover)' : 'var(--text-muted)',
                            fontWeight: '600'
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Hapus Pengguna">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
