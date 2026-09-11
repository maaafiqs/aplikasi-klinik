import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Activity, Clock, ShieldCheck, Info, 
  MapPin, Phone, Mail, Stethoscope, Users, CheckCircle2, 
  Building2, Sparkles, Calendar, Search, CreditCard, 
  AlertCircle, ChevronDown, ChevronUp, RefreshCw, Ambulance,
  HeartPulse, PhoneCall, Award, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { ActiveQueuesData, Doctor } from '../types';

const Home = () => {
  const [activeQueues, setActiveQueues] = useState<ActiveQueuesData>({ running: [], waiting: [] });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<string>('Semua');
  const [searchDoctor, setSearchDoctor] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stats, setStats] = useState({
    totalPatients: 10,
    totalDoctors: 8,
    totalPolis: 6,
    activeToday: 0
  });

  // Fetch active queues
  const fetchQueues = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/queues/active`);
      if (res.ok) {
        const data = await res.json();
        setActiveQueues(data);
      }
    } catch (error) {
      console.error('Failed to fetch active queues', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  // Fetch clinic stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchQueues();
    fetchDoctors();
    fetchStats();

    // Check if hash exists in URL on mount and scroll smoothly
    if (window.location.hash) {
      setTimeout(() => {
        const elem = document.querySelector(window.location.hash);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    const handleHashChange = () => {
      if (window.location.hash) {
        const elem = document.querySelector(window.location.hash);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Auto refresh active queues every 15 seconds
    const interval = setInterval(fetchQueues, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // List of distinct Poliklinik for filters
  const poliCategories = useMemo(() => {
    const categories = ['Semua'];
    doctors.forEach(d => {
      if (d.specialty && !categories.includes(d.specialty)) {
        categories.push(d.specialty);
      }
    });
    return categories;
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchPoli = selectedPoli === 'Semua' || doc.specialty === selectedPoli;
      const matchSearch = doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase());
      return matchPoli && matchSearch;
    });
  }, [doctors, selectedPoli, searchDoctor]);

  // Current day in Indonesian for doctor availability check
  const currentDayName = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  }, []);

  // FAQ List
  const faqs = [
    {
      q: 'Bagaimana cara mendaftar antrean rawat jalan secara online?',
      a: 'Anda dapat membuat akun baru atau login, kemudian pilih menu "Pendaftaran", tentukan Poliklinik tujuan, pilih dokter yang bertugas, pilih tanggal kunjungan dan jenis pembayaran (BPJS / Mandiri). Anda akan langsung mendapatkan nomor antrean digital yang dapat dicetak atau disimpan di HP.'
    },
    {
      q: 'Apakah pendaftaran dengan BPJS Kesehatan gratis?',
      a: 'Ya, seluruh pemeriksaan rawat jalan yang terdaftar menggunakan BPJS Kesehatan ditanggung 100% sesuai regulasi yang berlaku, asalkan status kepesertaan aktif dan memenuhi prosedur rujukan faskes.'
    },
    {
      q: 'Berapa lama sebelum jadwal praktik pasien harus tiba di klinik?',
      a: 'Kami menyarankan pasien untuk tiba minimal 15–20 menit sebelum estimasi nomor antrean dipanggil untuk melakukan konfirmasi ulang di loket pendaftaran.'
    },
    {
      q: 'Apakah ada layanan gawat darurat (IGD) di luar jam poli?',
      a: 'Ya! Layanan Instalasi Gawat Darurat (IGD) dan Farmasi Klinik Maaafiqs Berkah siap melayani Anda 24 jam setiap hari tanpa libur.'
    },
    {
      q: 'Bagaimana jika saya terlambat saat nomor antrean sudah terlewat?',
      a: 'Jika nomor antrean terlewat, Anda cukup melapor ke petugas pendaftaran / perawat jaga di poliklinik. Petugas akan mengatur pemanggilan susulan setelah antrean berikutnya selesai diperiksa.'
    }
  ];

  return (
    <div className="home-container" style={{ overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <section className="hero" style={{ padding: '4.5rem 0 5rem', position: 'relative' }}>
        <div className="container">
          
          {/* Status Badge Live */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', background: '#FFFFFF', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Klinik Buka Hari Ini: <span style={{ color: '#047857' }}>07:00 - 21:00 WIB</span> • IGD Siaga 24 Jam
            </span>
          </div>

          <h1 className="hero-title" style={{ maxWidth: '900px', margin: '0 auto 1.25rem' }}>
            Layanan Kesehatan Lengkap, Cepat & <span>Terpercaya</span>
          </h1>
          
          <p className="hero-subtitle" style={{ maxWidth: '750px', fontSize: '1.15rem' }}>
            Selamat datang di <strong>Klinik Maaafiqs Berkah</strong>. Kami menghadirkan kemudahan pendaftaran rawat jalan online, jadwal dokter terpadu, antrean transparan realtime, dan fasilitas medis berstandar tinggi untuk seluruh keluarga Anda.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link to="/pendaftaran" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
              Daftar Rawat Jalan Online <ArrowRight size={20} />
            </Link>
            <a href="#jadwal-dokter" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', backgroundColor: '#fff' }}>
              <Stethoscope size={18} /> Lihat Jadwal Dokter
            </a>
            <a href="#antrean-live" className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', backgroundColor: '#fff' }}>
              <Clock size={18} /> Cek Antrean Live
            </a>
          </div>

          {/* Quick trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10B981" /> Menerima Pasien BPJS & Umum
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10B981" /> Sistem Antrean Paperless Cepat
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10B981" /> Rekam Medis Digital Terenkripsi
            </span>
          </div>

        </div>
      </section>

      {/* 2. TOP QUICK INFO BAR (4 Essential Pillars) */}
      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="quick-info-strip">
          
          <div className="quick-card">
            <div className="quick-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Jam Poliklinik</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Senin - Sabtu: 07:00 - 21:00</div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>Minggu: 08:00 - 14:00 WIB</div>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <Ambulance size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>IGD & Farmasi</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>24 Jam Non-Stop</div>
              <div style={{ fontSize: '0.75rem', color: '#DC2626' }}>Siaga Kedaruratan Medis</div>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon-wrapper" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kontak Telepon</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>(0111) 777888444</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Layanan Informasi Pasien</div>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon-wrapper" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Lokasi Klinik</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Jl. Kesehatan Raya No. 88</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pekanbaru, Riau, Indonesia</div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. RUNNING MARQUEE & LIVE QUEUE MONITOR */}
      <div id="antrean-live" style={{ marginTop: '3.5rem' }}>
        
        {/* Marquee Ticker */}
        <div style={{ backgroundColor: 'var(--primary-yellow)', color: '#1F2937', padding: '0.75rem 0', display: 'flex', alignItems: 'center', borderTop: '1px solid #F59E0B', borderBottom: '1px solid #F59E0B' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, whiteSpace: 'nowrap', paddingRight: '1rem', borderRight: '2px solid rgba(0,0,0,0.1)' }}>
              <Info size={18} /> Papan Antrean Hari Ini:
            </div>
            <div style={{ overflow: 'hidden', flex: 1, paddingLeft: '1rem' }}>
              <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 22s linear infinite' }}>
                {activeQueues.running.length === 0 && activeQueues.waiting.length === 0 ? (
                  <span style={{ fontWeight: 500 }}>Belum ada antrean berjalan saat ini. Pendaftaran hari ini dibuka normal.</span>
                ) : (
                  <>
                    {activeQueues.running.length > 0 && (
                      <span style={{ marginRight: '2.5rem' }}>
                        <strong style={{ color: '#065F46', background: 'rgba(255,255,255,0.7)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          SEDANG DIPERIKSA:
                        </strong>{' '}
                        {activeQueues.running.map(q => `${q.no_antrian} (${q.poli_tujuan})`).join(' • ')}
                      </span>
                    )}
                    {activeQueues.waiting.length > 0 && (
                      <span>
                        <strong style={{ color: '#92400E', background: 'rgba(255,255,255,0.7)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ANTREAN BERIKUTNYA:
                        </strong>{' '}
                        {activeQueues.waiting.map(q => `${q.no_antrian} (${q.poli_tujuan})`).join(' • ')}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Queue Board Details Card */}
        <section className="container" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
          <div className="card" style={{ border: '2px solid rgba(251, 191, 36, 0.4)', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span className="section-tag">
                  <Activity size={14} /> Monitoring Antrean Realtime
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>Status Antrean Rawat Jalan Hari Ini</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Pantau panggilan antrean dari mana saja secara langsung untuk meminimalkan waktu tunggu di klinik.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={fetchQueues} 
                  disabled={isRefreshing}
                  className="btn btn-outline" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#fff' }}
                  title="Perbarui data antrean"
                >
                  <RefreshCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
                  {isRefreshing ? 'Memperbarui...' : 'Segarkan'}
                </button>
                <Link to="/pendaftaran" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                  Ambil Antrean Baru
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Sedang Diperiksa */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="pulse-dot"></span>
                    <span style={{ fontWeight: 700, color: '#166534', fontSize: '1rem' }}>Sedang Diperiksa</span>
                  </div>
                  <span className="badge-pill badge-green">{activeQueues.running.length} Pasien</span>
                </div>

                {activeQueues.running.length === 0 ? (
                  <div style={{ color: '#15803D', fontSize: '0.9rem', padding: '1.5rem 0', textAlign: 'center' }}>
                    Belum ada antrean yang sedang diperiksa di ruang dokter saat ini.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeQueues.running.map((q, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #86EFAC', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D' }}>{q.no_antrian}</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.poli_tujuan}</div>
                        </div>
                        <span className="badge-pill badge-green">Di Ruang Periksa</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Menunggu Panggilan */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="#D97706" />
                    <span style={{ fontWeight: 700, color: '#92400E', fontSize: '1rem' }}>Menunggu Panggilan</span>
                  </div>
                  <span className="badge-pill badge-amber">{activeQueues.waiting.length} Pasien</span>
                </div>

                {activeQueues.waiting.length === 0 ? (
                  <div style={{ color: '#B45309', fontSize: '0.9rem', padding: '1.5rem 0', textAlign: 'center' }}>
                    Tidak ada antrean yang sedang menunggu. Pendaftaran langsung dilayani!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeQueues.waiting.map((q, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #FCD34D', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B45309' }}>{q.no_antrian}</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.poli_tujuan}</div>
                        </div>
                        <span className="badge-pill badge-amber">Urutan #{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informasi & Petunjuk Pasien */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                    <AlertCircle size={18} color="#0284C7" /> Petunjuk Kehadiran Pasien
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>Harap hadir di klinik paling lambat <strong>15 menit</strong> sebelum estimasi panggilan.</li>
                    <li>Siapkan kartu identitas (KTP/NIK) dan Kartu BPJS (bagi pasien BPJS).</li>
                    <li>Tunjukkan bukti tiket antrean digital / cetak ke petugas loket rawat jalan.</li>
                    <li>Dilarang meninggalkan area ruang tunggu saat nomor antrean Anda mendekati 2 urutan.</li>
                  </ul>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Pembaruan data otomatis setiap 15 detik.
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* 4. STATISTIK KLINIK DALAM ANGKA */}
      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{stats.totalDoctors || 8}+</div>
            <div className="stat-label">Dokter Spesialis & Umum</div>
            <div className="stat-desc">Tenaga medis bersertifikasi resmi</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalPolis || 6}</div>
            <div className="stat-label">Layanan Poliklinik</div>
            <div className="stat-desc">Poli Gigi, Umum, Anak, Penyakit Dalam, dll</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10.000+</div>
            <div className="stat-label">Pasien Terlayani</div>
            <div className="stat-desc">Kepercayaan keluarga sejak berdiri</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.5%</div>
            <div className="stat-label">Kepuasan Pelayanan</div>
            <div className="stat-desc">Berdasarkan ulasan dan survei pasien</div>
          </div>
        </div>
      </section>

      {/* 5. JADWAL DOKTER & POLIKLINIK LENGKAP */}
      <section id="jadwal-dokter" style={{ backgroundColor: '#F8FAFC', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div className="section-header">
            <span className="section-tag">
              <Calendar size={14} /> Praktik & Keahlian
            </span>
            <h2 className="section-title">Jadwal Praktik Dokter Terpadu</h2>
            <p className="section-subtitle">
              Pilih poliklinik dan temukan jadwal dokter spesialis kami. Anda dapat langsung memilih dokter yang diinginkan saat pendaftaran rawat jalan.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari dokter berdasarkan nama atau poli..." 
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem', borderRadius: '9999px', backgroundColor: '#fff' }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {poliCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedPoli(cat)}
                  className={`doc-filter-btn ${selectedPoli === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
              <Stethoscope size={48} color="#D97706" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Dokter Tidak Ditemukan</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tidak ada dokter yang sesuai dengan filter atau pencarian Anda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredDoctors.map(doc => {
                const isPracticingToday = doc.available_days ? doc.available_days.includes(currentDayName) : false;

                return (
                  <div key={doc.id} className="doctor-card">
                    <div>
                      {/* Top Header Card */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '48px', height: '48px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: '#78350F', fontSize: '1.1rem'
                          }}>
                            {doc.name.replace('dr. ', '').replace('drg. ', '').charAt(0)}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{doc.name}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#D97706', fontWeight: 600 }}>{doc.specialty}</div>
                          </div>
                        </div>

                        {isPracticingToday ? (
                          <span className="badge-pill badge-green" title="Dokter praktik hari ini">
                            <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span> Praktik Hari Ini
                          </span>
                        ) : (
                          <span className="badge-pill badge-amber">
                            {doc.available_days ? doc.available_days.split(',')[0] : 'Sesuai Jadwal'}
                          </span>
                        )}
                      </div>

                      {/* Schedule Details */}
                      <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.85rem', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                          <Calendar size={15} color="#D97706" />
                          <span>Hari Praktik: <strong>{doc.available_days || 'Setiap Hari Kerja'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Clock size={15} color="#D97706" />
                          <span>Jam: <strong>{doc.schedule}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <Link 
                      to="/pendaftaran" 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      Daftar ke Dokter Ini <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 6. LAYANAN POLIKLINIK & FASILITAS UNGGULAN */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="section-header">
          <span className="section-tag">
            <Building2 size={14} /> Layanan Komprehensif
          </span>
          <h2 className="section-title">Poliklinik & Fasilitas Medis Lengkap</h2>
          <p className="section-subtitle">
            Kami menyediakan beragam spesialisasi medis dan sarana penunjang diagnosis modern untuk memastikan pemulihan kesehatan Anda berjalan optimal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
          
          <div className="service-card">
            <div className="service-icon-box">
              <Stethoscope size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Poli Umum</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Pelayanan kesehatan tingkat pertama, konsultasi medis menyeluruh, penanganan demam, flu, batuk, hipertensi ringan, dan pembuatan surat keterangan sehat.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              Dokter Umum Berpengalaman • Setiap Hari
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon-box">
              <Sparkles size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Poli Gigi & Mulut</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Perawatan kesehatan gigi menyeluruh: pembersihan karang gigi (scaling), penambalan estetik, pencabutan gigi, perawatan saluran akar, dan edukasi kesehatan gigi.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              drg. Spesialis Konservasi & Periodonsia
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon-box">
              <Users size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Poli Anak & Tumbuh Kembang</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Pemeriksaan spesialis anak, pemantauan status gizi dan pertumbuhan, penanganan alergi dan infeksi pada anak, serta program vaksinasi & imunisasi lengkap.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              Dokter Spesialis Anak (Sp.A) Ramah Anak
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon-box">
              <Activity size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Poli Penyakit Dalam</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Diagnosis dan manajemen komprehensif penyakit kronis: diabetes mellitus, gangguan metabolik, gangguan lambung/gastrointestinal, ginjal, dan kardiovaskular.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              Dokter Spesialis Penyakit Dalam (Sp.PD)
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon-box">
              <ShieldCheck size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Laboratorium & Farmasi 24 Jam</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Fasilitas laboratorium darah rutin, kimia darah, kolesterol, asam urat, gula darah, urine lengkap, serta apotek farmasi obat terpercaya siap 24 jam.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              Hasil Cepat & Akurat • Obat Terdaftar BPOM
            </div>
          </div>

          <div className="service-card">
            <div className="service-icon-box">
              <Ambulance size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>IGD & Pelayanan Ambulans</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Unit Gawat Darurat yang siap merespons kondisi kritis, luka traumatik, pertolongan pertama, observasi pasien, dan armada ambulans siaga 24 jam.
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
              Hotline Emergency: (0111) 777888444
            </div>
          </div>

        </div>
      </section>

      {/* 7. ALUR & CARA PENDAFTARAN RAWAT JALAN ONLINE */}
      <section style={{ backgroundColor: '#FFFDF5', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          
          <div className="section-header">
            <span className="section-tag">
              <Sparkles size={14} /> Alur Pendaftaran
            </span>
            <h2 className="section-title">4 Langkah Mudah Berobat Tanpa Antre Lama</h2>
            <p className="section-subtitle">
              Sistem pendaftaran rawat jalan online kami dirancang agar Anda bisa merencanakan kunjungan berobat dengan efisien dan nyaman.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            
            <div className="step-card">
              <div className="step-number">1</div>
              <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Daftar / Masuk Akun</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Buat akun baru atau masuk dengan email Anda. Lengkapi NIK dan data diri profil sekali saja untuk kemudahan pendaftaran berulang.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pilih Poli & Dokter</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Pilih poliklinik yang sesuai dengan keluhan Anda dan tentukan dokter spesialis yang sedang bertugas sesuai jadwal praktik.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Jadwal & Pembayaran</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Tentukan tanggal kunjungan dan pilih metode pembayaran (BPJS Kesehatan, Umum / Mandiri, atau Asuransi rekanan).
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div style={{ marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tiket Antrean Digital</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Nomor antrean langsung terbit! Cetak atau simpan tiket di smartphone Anda dan datang ke loket klinik 15 menit sebelum giliran.
                </p>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/pendaftaran" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
              Mulai Pendaftaran Sekarang <ArrowRight size={20} />
            </Link>
          </div>

        </div>
      </section>

      {/* 8. KETENTUAN PEMBAYARAN (BPJS & UMUM) */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="section-header">
          <span className="section-tag">
            <CreditCard size={14} /> Metode Pembayaran
          </span>
          <h2 className="section-title">Fleksibilitas Pembayaran Berobat</h2>
          <p className="section-subtitle">
            Klinik Maaafiqs Berkah melayani berbagai metode pembayaran demi memudahkan akses layanan kesehatan berkualitas bagi Anda dan keluarga.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* BPJS Card */}
          <div className="card" style={{ border: '2px solid #10B981', background: '#F0FDF4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065F46' }}>Pasien BPJS Kesehatan</h3>
                <span className="badge-pill badge-green">Fasilitas Kesehatan Tingkat Pertama</span>
              </div>
            </div>

            <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Bebas biaya konsultasi dan obat-obatan sesuai formularium nasional BPJS Kesehatan.
            </p>

            <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <strong style={{ fontSize: '0.85rem', color: '#065F46', display: 'block', marginBottom: '0.5rem' }}>Persyaratan Berobat BPJS:</strong>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#15803D', lineHeight: 1.6 }}>
                <li>Nomor Kartu BPJS / KIS aktif (dapat dicek di Mobile JKN).</li>
                <li>Kartu Tanda Penduduk (KTP) atau Kartu Keluarga bagi anak.</li>
                <li>Surat rujukan (khusus poli spesialis yang memerlukan rujukan faskes primer).</li>
              </ul>
            </div>
          </div>

          {/* Pasien Umum & Mandiri */}
          <div className="card" style={{ border: '2px solid var(--primary-yellow)', background: '#FFFDF5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-yellow)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#78350F' }}>Pasien Umum & Asuransi Swasta</h3>
                <span className="badge-pill badge-amber">Tarif Transparan & Terjangkau</span>
              </div>
            </div>

            <p style={{ color: '#92400E', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Pelayanan medis langsung tanpa syarat rujukan berjenjang dengan tarif konsultasi dan tindakan yang transparan.
            </p>

            <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <strong style={{ fontSize: '0.85rem', color: '#78350F', display: 'block', marginBottom: '0.5rem' }}>Metode Pembayaran yang Diterima:</strong>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#B45309', lineHeight: 1.6 }}>
                <li>Uang Tunai (Cash) di kasir klinik.</li>
                <li>QRIS (BCA, Mandiri, BNI, BRI, GoPay, OVO, ShopeePay).</li>
                <li>Kartu Debit & Kredit seluruh bank berlogo GPN, Visa, Mastercard.</li>
                <li>Klaim Asuransi Kesehatan Rekanan Swasta.</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 9. FAQ (PERTANYAAN YANG SERING DIAJUKAN) */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          <div className="section-header">
            <span className="section-tag">
              <HelpCircle size={14} /> Tanya Jawab
            </span>
            <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
            <p className="section-subtitle">
              Temukan jawaban cepat atas pertanyaan umum seputar operasional, pendaftaran online, dan fasilitas klinik kami.
            </p>
          </div>

          <div>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="faq-item">
                  <button 
                    className="faq-header"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} color="#D97706" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </button>
                  {isOpen && (
                    <div className="faq-content">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 10. INFORMASI KONTAK, LOKASI & EMERGENCY BANNER */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        
        {/* Emergency Hotline Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', 
          borderRadius: 'var(--radius-xl)', 
          padding: '2.5rem', 
          color: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.25)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              UNIT GAWAT DARURAT 24 JAM
            </span>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.75rem 0 0.5rem' }}>
              Butuh Pertolongan Medis Darurat?
            </h3>
            <p style={{ opacity: 0.9, maxWidth: '550px', fontSize: '0.95rem' }}>
              Tim medis IGD dan armada ambulans siaga 24/7 siap memberikan pertolongan pertama dan penanganan darurat segera.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a 
              href="tel:0111777888444" 
              className="btn" 
              style={{ background: '#fff', color: '#DC2626', fontWeight: 700, padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PhoneCall size={20} /> Hubungi (0111) 777888444
            </a>
          </div>
        </div>

        {/* Location & Contact Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} color="#D97706" /> Lokasi & Petunjuk Arah
            </h3>
            <p style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Klinik Maaafiqs Berkah
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Jl. Kesehatan Raya No. 88, Kelurahan Berkah, Kota Pekanbaru, Riau, Indonesia. 
              (Sebelah Gedung Apotek Berkah Medika, 200 meter dari Bundaran Utama).
            </p>

            <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '1rem' }}>
              🅿️ <strong>Fasilitas Parkir:</strong> Tersedia area parkir mobil dan motor yang luas, aman dengan petugas sekuriti 24 jam. Akses ramah kursi roda dan difabel.
            </div>

            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.9rem' }}
            >
              Buka di Google Maps
            </a>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={22} color="#D97706" /> Jam Operasional Layanan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Poliklinik Rawat Jalan</span>
                <span style={{ color: 'var(--text-muted)' }}>Senin - Sabtu: 07.00 - 21.00 WIB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Poli Minggu & Hari Libur</span>
                <span style={{ color: 'var(--text-muted)' }}>Minggu: 08.00 - 14.00 WIB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Unit Gawat Darurat (IGD)</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>24 Jam Non-Stop</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 600 }}>Apotek & Farmasi</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>24 Jam Non-Stop</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Laboratorium Darah</span>
                <span style={{ color: 'var(--text-muted)' }}>Senin - Sabtu: 07.00 - 20.00 WIB</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 11. FOOTER LENGKAP */}
      <footer className="site-footer">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
            
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                <HeartPulse size={26} color="#FBBF24" /> Klinik Maaafiqs
              </div>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Pusat pelayanan rawat jalan dan kesehatan terpadu. Melayani masyarakat dengan dedikasi, integritas, dan teknologi modern.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1F2937', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', color: '#FBBF24' }}>
                <Award size={16} /> Izin Operasional Faskes: 445/DINKES/KLINIK/2024
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Tautan Cepat</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <li><Link to="/">Beranda Utama</Link></li>
                <li><Link to="/pendaftaran">Pendaftaran Rawat Jalan</Link></li>
                <li><a href="#jadwal-dokter">Jadwal Praktik Dokter</a></li>
                <li><a href="#antrean-live">Status Antrean Hari Ini</a></li>
                <li><Link to="/riwayat">Riwayat Pendaftaran</Link></li>
                <li><Link to="/login">Masuk ke Akun Pasien</Link></li>
              </ul>
            </div>

            {/* Poliklinik */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Layanan Poliklinik</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
                <li>Poli Umum & Medical Check Up</li>
                <li>Poli Gigi & Mulut</li>
                <li>Poli Spesialis Anak (Pediatri)</li>
                <li>Poli Spesialis Penyakit Dalam</li>
                <li>Poli Spesialis Mata & THT</li>
                <li>Laboratorium & Farmasi 24 Jam</li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Hubungi Kami</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={18} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Jl. Kesehatan Raya No. 88, Pekanbaru, Riau, Indonesia</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                  <span>(0111) 777888444 (Layanan Informasi)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                  <span>layanan@klinikmaaafiqs.com</span>
                </div>
              </div>
            </div>

          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Klinik Maaafiqs Berkah. Seluruh hak cipta dilindungi undang-undang.</p>
            <p style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#6B7280' }}>
              Data medis dan data pribadi pasien dilindungi dengan enkripsi standar industri kesehatan.
            </p>
          </div>
        </div>
      </footer>

      {/* Marquee & Spin Keyframe Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
