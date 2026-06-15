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
    { key: 'pending',     label: 'Pendientes',  color: '#f5a623', bg: 'rgba(245,158,11,0.1)' },
    { key: 'in_progress', label: 'En proceso',  color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
    { key: 'resolved',    label: 'Resueltos',   color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
    { key: 'rejected',    label: 'Rechazados',  color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
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
          <div style={{ ...styles.statCard, background: 'rgba(34,197,94,0.08)' }}>
            <div style={{ ...styles.statNumber, color: '#4ade80' }}>{stats?.lastWeek || 0}</div>
            <div style={styles.statLabel}>Esta semana</div>
          </div>
          <div style={{ ...styles.statCard, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ ...styles.statNumber, color: '#d1d1d6' }}>{stats?.total || 0}</div>
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
  pending:     { background: 'rgba(245,158,11,0.15)', color: '#f5a623', padding: '2px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 },
  in_progress: { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 },
  resolved:    { background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '2px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 },
  rejected:    { background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 },
};

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 28px', fontSize: '1.6rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { borderRadius: '14px', padding: '22px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' },
  statNumber: { fontSize: '2rem', fontWeight: 800 },
  statLabel: { color: '#8e8e93', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' },
  card: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { margin: 0, fontSize: '1rem', color: '#ffffff', fontWeight: 700 },
  viewAll: { color: '#f5a623', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', color: '#48484a', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '10px 12px', fontSize: '0.88rem', color: '#d1d1d6' },
  link: { color: '#f5a623', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 },
  categories: { display: 'flex', flexDirection: 'column', gap: '10px' },
  catRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', color: '#d1d1d6' },
  catCount: { fontWeight: 700, color: '#f5a623' },
};
