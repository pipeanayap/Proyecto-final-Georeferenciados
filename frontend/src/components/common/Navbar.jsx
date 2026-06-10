import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} style={styles.brand}>
        🏙️ UrbanReport
      </Link>
      <div style={styles.links}>
        {user?.role === 'admin' ? (
          <>
            <Link to="/admin" style={styles.link}>Dashboard</Link>
            <Link to="/admin/reports" style={styles.link}>Reportes</Link>
            <Link to="/admin/users" style={styles.link}>Usuarios</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={styles.link}>Mis Reportes</Link>
            <Link to="/reports/new" style={styles.link}>+ Nuevo</Link>
          </>
        )}
        <span style={styles.user}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.btn}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', background: '#1e293b', color: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  brand: { textDecoration: 'none', color: '#fff', fontWeight: 700, fontSize: '1.2rem' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color .2s' },
  user: { color: '#64748b', fontSize: '0.85rem' },
  btn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
};
