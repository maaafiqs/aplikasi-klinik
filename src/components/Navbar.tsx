import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <HeartPulse size={28} className="nav-logo-icon" />
          Klinik Maaafiqs
        </Link>
        
        <button className="nav-mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className={`nav-link ${isActive('/admin')}`} style={{ color: 'var(--primary-yellow-hover)', fontWeight: '600' }} onClick={closeMenu}>Admin</Link>
              ) : (
                <>
                  <Link to="/pendaftaran" className={`nav-link ${isActive('/pendaftaran')}`} onClick={closeMenu}>Pendaftaran</Link>
                  <Link to="/riwayat" className={`nav-link ${isActive('/riwayat')}`} onClick={closeMenu}>Riwayat</Link>
                </>
              )}
              <Link to="/profil" className={`nav-link ${isActive('/profil')}`} onClick={closeMenu}>Profil</Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#ef4444', 
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
              <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
