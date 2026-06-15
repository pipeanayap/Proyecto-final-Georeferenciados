import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { toast } from 'react-toastify';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 20, search: search || undefined })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total); setPages(data.pages); })
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggleUser(id);
      setUsers((us) => us.map((u) => (u._id === id ? data.data : u)));
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar usuario');
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>Usuarios <span style={styles.badge}>{total}</span></h1>
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre o email..."
          style={styles.search}
        />
        {loading ? <Spinner /> : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.phone || '—'}</td>
                      <td style={styles.td}>
                        <span style={u.role === 'admin' ? styles.adminTag : styles.citizenTag}>
                          {u.role === 'admin' ? '🛡️ Admin' : '👤 Ciudadano'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={u.isActive ? styles.active : styles.inactive}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                      <td style={styles.td}>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleToggle(u._id)} style={u.isActive ? styles.deactivateBtn : styles.activateBtn}>
                            {u.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div style={styles.pagination}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={styles.pageBtn}>← Anterior</button>
                <span>Página {page} de {pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === pages} style={styles.pageBtn}>Siguiente →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 24px', fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', borderRadius: '999px', padding: '3px 14px', fontSize: '0.85rem', fontWeight: 700 },
  search: { width: '100%', maxWidth: '400px', padding: '11px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '20px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  tableWrap: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#48484a', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '12px 16px', fontSize: '0.88rem', color: '#d1d1d6' },
  adminTag: { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 },
  citizenTag: { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 },
  active: { background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 },
  inactive: { background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 },
  deactivateBtn: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s ease' },
  activateBtn: { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s ease' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', color: '#636366', fontSize: '0.9rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1d1d6', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' },
};
