import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getReports({ limit: 5, page: 1 }),
    ]).then(([statsRes, reportsRes]) => {
      setStats(statsRes.data.data);
      setRecentReports(reportsRes.data.reports);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><Spinner /></>;

  const STATUS_CARDS = [
    { key: 'pending',     label: 'Pendientes',  color: '#f59e0b', bg: '#fef3c7' },
    { key: 'in_progress', label: 'En proceso',  color: '#3b82f6', bg: '#dbeafe' },
    { key: 'resolved',    label: 'Resueltos',   color: '#22c55e', bg: '#dcfce7' },
    { key: 'rejected',    label: 'Rechazados',  color: '#ef4444', bg: '#fee2e2' },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>Panel de Administración</h1>

        <div style={styles.statsGrid}>
          {STATUS_CARDS.map(({ key, label, color, bg }) => (
            <div key={key} style={{ ...styles.statCard, background: bg }}>
              <div style={{ ...styles.statNumber, color }}>{stats?.byStatus[key] || 0}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
          <div style={{ ...styles.statCard, background: '#f0fdf4' }}>
            <div style={{ ...styles.statNumber, color: '#16a34a' }}>{stats?.lastWeek || 0}</div>
            <div style={styles.statLabel}>Esta semana</div>
          </div>
          <div style={{ ...styles.statCard, background: '#f8fafc' }}>
            <div style={{ ...styles.statNumber, color: '#475569' }}>{stats?.total || 0}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Reportes recientes</h2>
              <Link to="/admin/reports" style={styles.viewAll}>Ver todos →</Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>Categoría</th>
                  <th style={styles.th}>Ciudadano</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r._id} style={styles.tr}>
                    <td style={styles.td}>{r.title}</td>
                    <td style={styles.td}>{r.category?.icon} {r.category?.name}</td>
                    <td style={styles.td}>{r.citizen?.name}</td>
                    <td style={styles.td}>
                      <span style={STATUS_INLINE[r.status]}>{r.status}</span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/admin/reports/${r._id}`} style={styles.link}>Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Top categorías</h2>
            <div style={styles.categories}>
              {stats?.topCategories?.map((c) => (
                <div key={c._id} style={styles.catRow}>
                  <span>{c.icon} {c.name}</span>
                  <span style={styles.catCount}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const STATUS_INLINE = {
  pending:     { background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' },
  in_progress: { background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' },
  resolved:    { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' },
  rejected:    { background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' },
};

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 28px', fontSize: '1.6rem', color: '#1e293b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statNumber: { fontSize: '2rem', fontWeight: 700 },
  statLabel: { color: '#374151', fontSize: '0.85rem', marginTop: '4px' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 600 },
  viewAll: { color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '10px 12px', fontSize: '0.88rem', color: '#374151' },
  link: { color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem' },
  categories: { display: 'flex', flexDirection: 'column', gap: '10px' },
  catRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#374151' },
  catCount: { fontWeight: 700, color: '#1e293b' },
};
