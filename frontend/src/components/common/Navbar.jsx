import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/reports', label: 'Reportes' },
        { to: '/admin/users', label: 'Usuarios' },
      ]
    : [
        { to: '/dashboard', label: 'Mis Reportes' },
        { to: '/reports/new', label: '+ Nuevo' },
      ];

  return (
    <>
      <nav style={styles.nav}>
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} style={styles.brand}>
          UrbanReport
        </Link>
        <div style={styles.links}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                ...(isActive(to) ? styles.linkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={styles.right}>
          <span style={styles.user}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.btn}>Salir</button>
        </div>
      </nav>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
        body { margin: 0; background: #0e0e0e; }
        .nav-link:hover { color: #f5a623 !important; background: rgba(245,166,35,0.08) !important; }
      `}</style>
    </>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '64px', background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { textDecoration: 'none', color: '#f5a623', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' },
  links: { display: 'flex', alignItems: 'center', gap: '6px' },
  link: { color: '#8e8e93', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '7px 16px', borderRadius: '10px', transition: 'all 0.2s ease' },
  linkActive: { color: '#f5a623', background: 'rgba(245,166,35,0.1)' },
  right: { display: 'flex', alignItems: 'center', gap: '14px' },
  user: { color: '#636366', fontSize: '0.85rem', fontWeight: 500 },
  btn: { background: 'rgba(239,68,68,0.12)', color: '#ff6b6b', border: '1px solid rgba(239,68,68,0.2)', padding: '7px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, transition: 'all 0.2s ease' },
};
