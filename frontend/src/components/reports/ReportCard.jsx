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
  card: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s ease, transform 0.2s ease' },
  img: { width: '100%', height: '160px', objectFit: 'cover' },
  body: { padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: '0.8rem', color: '#636366' },
  title: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.3 },
  address: { margin: 0, fontSize: '0.82rem', color: '#636366' },
  meta: { margin: 0, fontSize: '0.82rem', color: '#636366' },
  footer: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  date: { fontSize: '0.78rem', color: '#48484a', marginLeft: 'auto' },
  link: { color: '#f5a623', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 },
};
