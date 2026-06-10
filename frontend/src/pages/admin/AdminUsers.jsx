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
  title: { margin: '0 0 24px', fontSize: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { background: '#3b82f6', color: '#fff', borderRadius: '999px', padding: '2px 12px', fontSize: '0.85rem' },
  search: { width: '100%', maxWidth: '400px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', boxSizing: 'border-box' },
  tableWrap: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px 16px', fontSize: '0.88rem', color: '#374151' },
  adminTag: { background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' },
  citizenTag: { background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' },
  active: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' },
  inactive: { background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' },
  deactivateBtn: { background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  activateBtn: { background: '#dcfce7', color: '#166534', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  pageBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
};
