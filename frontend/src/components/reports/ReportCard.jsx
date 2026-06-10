import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function ReportCard({ report, adminView = false }) {
  const link = adminView ? `/admin/reports/${report._id}` : `/reports/${report._id}`;

  return (
    <div style={styles.card}>
      {report.photos?.length > 0 && (
        <img src={report.photos[0].url} alt="foto" style={styles.img} />
      )}
      <div style={styles.body}>
        <div style={styles.header}>
          <span style={styles.category}>
            {report.category?.icon} {report.category?.name}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <h3 style={styles.title}>{report.title}</h3>
        <p style={styles.address}>📍 {report.location?.address}</p>
        {adminView && (
          <p style={styles.meta}>
            Por: <strong>{report.citizen?.name}</strong>
          </p>
        )}
        <div style={styles.footer}>
          <span style={{ color: PRIORITY_COLOR[report.priority], fontSize: '0.8rem', fontWeight: 600 }}>
            ● {report.priority === 'low' ? 'Baja' : report.priority === 'high' ? 'Alta' : 'Media'}
          </span>
          <span style={styles.date}>
            {new Date(report.createdAt).toLocaleDateString('es-MX')}
          </span>
          <Link to={link} style={styles.link}>Ver detalle →</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  img: { width: '100%', height: '160px', objectFit: 'cover' },
  body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: '0.8rem', color: '#64748b' },
  title: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 },
  address: { margin: 0, fontSize: '0.82rem', color: '#64748b' },
  meta: { margin: 0, fontSize: '0.82rem', color: '#64748b' },
  footer: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' },
  date: { fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto' },
  link: { color: '#3b82f6', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 },
};
