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
  title: { margin: '0 0 24px', fontSize: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { background: '#3b82f6', color: '#fff', borderRadius: '999px', padding: '2px 12px', fontSize: '0.85rem' },
  filtersRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' },
  search: { flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' },
  select: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '40px 0' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' },
  pageBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
};
