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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title: { margin: 0, fontSize: '1.6rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px' },
  sub: { margin: '6px 0 0', color: '#636366', fontSize: '0.9rem' },
  newBtn: { background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', padding: '11px 22px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s ease', letterSpacing: '0.2px' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' },
  filterBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#8e8e93', transition: 'all 0.2s ease', fontWeight: 500 },
  filterActive: { borderColor: '#f5a623', background: 'rgba(245,166,35,0.1)', color: '#f5a623' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#636366' },
  link: { color: '#f5a623', fontWeight: 600, textDecoration: 'none' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1d1d6', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease' },
  pageInfo: { color: '#636366', fontSize: '0.9rem' },
};
