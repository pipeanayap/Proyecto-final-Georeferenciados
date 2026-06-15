import { useState, useEffect } from 'react';
import { adminApi, categoriesApi } from '../../services/api';
import { toast } from 'react-toastify';
import ReportCard from '../../components/reports/ReportCard';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';

const STATUSES = ['', 'pending', 'in_progress', 'resolved', 'rejected'];

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    adminApi.getReports(params)
      .then(({ data }) => { setReports(data.reports); setTotal(data.total); setPages(data.pages); })
      .catch(() => toast.error('Error al cargar reportes'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>Todos los reportes <span style={styles.badge}>{total}</span></h1>

        <div style={styles.filtersRow}>
          <input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Buscar por título, descripción..."
            style={styles.search}
          />
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} style={styles.select}>
            <option value="">Todos los estados</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} style={styles.select}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} style={styles.select}>
            <option value="">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div style={styles.grid}>
              {reports.map((r) => <ReportCard key={r._id} report={r} adminView />)}
            </div>
            {reports.length === 0 && <p style={styles.empty}>No se encontraron reportes.</p>}
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
  filtersRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' },
  search: { flex: 1, minWidth: '200px', padding: '11px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  select: { padding: '11px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', background: 'rgba(28, 28, 30, 0.95)', color: '#d1d1d6', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', color: '#48484a', padding: '40px 0' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px', color: '#636366', fontSize: '0.9rem' },
  pageBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d1d1d6', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' },
};
