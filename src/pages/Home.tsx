import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Clock, ShieldCheck, Info } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { ActiveQueuesData } from '../types';

const Home = () => {
  const [activeQueues, setActiveQueues] = useState<ActiveQueuesData>({ running: [], waiting: [] });

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/queues/active`);
        if (res.ok) {
          setActiveQueues(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch active queues', error);
      }
    };
    fetchQueues();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchQueues, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Kesehatan Anda adalah <span>Prioritas Kami</span>
          </h1>
          <p className="hero-subtitle">
            Klinik Maaafiqs Berkah melayani pendaftaran rawat jalan dengan cepat, mudah, dan terpercaya. Kami hadir dengan fasilitas modern untuk kenyamanan Anda.
          </p>
          <div className="flex-center" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/pendaftaran" className="btn btn-primary">
              Daftar Rawat Jalan <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn btn-outline">
              Buat Akun Baru
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee Info Bar */}
      <div style={{ backgroundColor: 'var(--primary-yellow)', color: 'var(--text-color)', padding: '0.75rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', backgroundColor: 'var(--primary-yellow)', zIndex: 1 }}>
          <Info size={20} /> Info Antrean:
        </div>
        <div style={{ overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 20s linear infinite' }}>
            {activeQueues.running.length === 0 && activeQueues.waiting.length === 0 ? (
              <span>Belum ada antrean yang berjalan hari ini.</span>
            ) : (
              <>
                {activeQueues.running.length > 0 && (
                  <span style={{ marginRight: '2rem' }}>
                    <strong style={{ color: '#03543F' }}>SEDANG DIPERIKSA:</strong> {activeQueues.running.map(q => `${q.no_antrian} (${q.poli_tujuan})`).join(', ')}
                  </span>
                )}
                {activeQueues.waiting.length > 0 && (
                  <span>
                    <strong>MENUNGGU:</strong> {activeQueues.waiting.map(q => `${q.no_antrian} (${q.poli_tujuan})`).join(', ')}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>

      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--primary-yellow-hover)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Activity size={48} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Fasilitas Modern</h3>
            <p style={{ color: 'var(--text-muted)' }}>Peralatan medis terkini untuk diagnosis yang akurat dan cepat.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--primary-yellow-hover)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Clock size={48} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Layanan Cepat</h3>
            <p style={{ color: 'var(--text-muted)' }}>Sistem antrean online yang mengurangi waktu tunggu Anda.</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--primary-yellow-hover)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ShieldCheck size={48} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Terpercaya</h3>
            <p style={{ color: 'var(--text-muted)' }}>Tenaga medis profesional dan berpengalaman di bidangnya.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
