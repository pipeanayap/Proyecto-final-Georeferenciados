import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReportCard from '../../components/reports/ReportCard';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';

const STATUSES = ['', 'pending', 'in_progress', 'resolved', 'rejected'];

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi.getMine({ page, status: status || undefined, limit: 9 })
      .then(({ data }) => {
        setReports(data.reports);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => toast.error('Error al cargar reportes'))
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Mis Reportes</h1>
            <p style={styles.sub}>Bienvenido, {user?.name} — {total} reporte{total !== 1 ? 's' : ''} en total</p>
          </div>
          <Link to="/reports/new" style={styles.newBtn}>+ Nuevo reporte</Link>
        </div>

        <div style={styles.filters}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              style={{ ...styles.filterBtn, ...(status === s ? styles.filterActive : {}) }}
            >
              {s === '' ? 'Todos' : <StatusBadge status={s} />}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {reports.length === 0 ? (
              <div style={styles.empty}>
                <p>No tienes reportes aún.</p>
                <Link to="/reports/new" style={styles.link}>Crea tu primer reporte</Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {reports.map((r) => <ReportCard key={r._id} report={r} />)}
              </div>
            )}
            {pages > 1 && (
              <div style={styles.pagination}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={styles.pageBtn}>← Anterior</button>
                <span style={styles.pageInfo}>Página {page} de {pages}</span>
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
  page: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: 0, fontSize: '1.6rem', color: '#1e293b' },
  sub: { margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' },
  newBtn: { background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
  filterBtn: { background: '#f1f5f9', border: '2px solid transparent', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' },
  filterActive: { borderColor: '#3b82f6', background: '#eff6ff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#64748b' },
  link: { color: '#3b82f6', fontWeight: 600 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' },
  pageBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  pageInfo: { color: '#64748b', fontSize: '0.9rem' },
};
