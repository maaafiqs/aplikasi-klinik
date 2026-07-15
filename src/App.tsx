import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PendaftaranRawatJalan from './pages/PendaftaranRawatJalan';
import Riwayat from './pages/Riwayat';
import Profil from './pages/Profil';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pendaftaran" element={<PendaftaranRawatJalan />} />
            <Route path="/riwayat" element={<Riwayat />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
