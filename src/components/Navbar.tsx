import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, Menu, X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1) ? 'active' : '';
    }
    return location.pathname === path && !location.hash ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleSectionClick = (hash: string) => {
    closeMenu();
    if (location.pathname === '/') {
      const elem = document.querySelector(hash);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <HeartPulse size={28} className="nav-logo-icon" />
            Klinik Maaafiqs
          </Link>
          {timeString && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(0,0,0,0.03)',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px'
            }}>
              <Clock size={13} style={{ color: 'var(--primary-yellow-hover)' }} />
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{timeString}</span>
            </div>
          )}
        </div>
        
        <button className="nav-mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/pendaftaran" className={`nav-link ${isActive('/pendaftaran')}`} onClick={closeMenu}>
            Pendaftaran
          </Link>
          <a 
            href="#jadwal-dokter" 
            className={`nav-link ${isActive('/#jadwal-dokter')}`} 
            onClick={(e) => { e.preventDefault(); handleSectionClick('#jadwal-dokter'); }}
          >
            Jadwal Dokter
          </a>
          <a 
            href="#antrean-live" 
            className={`nav-link ${isActive('/#antrean-live')}`} 
            onClick={(e) => { e.preventDefault(); handleSectionClick('#antrean-live'); }}
          >
            Info Antrean
          </a>
          <Link to="/riwayat" className={`nav-link ${isActive('/riwayat')}`} onClick={closeMenu}>
            Riwayat
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin')}`} style={{ color: 'var(--primary-yellow-hover)', fontWeight: '600' }} onClick={closeMenu}>
                  Admin
                </Link>
              )}
              <Link to="/profil" className={`nav-link ${isActive('/profil')}`} onClick={closeMenu}>
                Profil
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#ef4444', 
                  color: '#ffffff',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
