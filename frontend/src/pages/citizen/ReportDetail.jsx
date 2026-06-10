import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { reportsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reportsApi.getById(id)
      .then(({ data }) => setReport(data.data))
      .catch(() => { toast.error('Reporte no encontrado'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await reportsApi.addComment(id, comment.trim());
      setReport((r) => ({ ...r, comments: [...(r.comments || []), data.data] }));
      setComment('');
      toast.success('Comentario enviado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al comentar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;
  if (!report) return null;

  const coords = report.location?.coordinates;

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <button onClick={() => navigate(-1)} style={styles.back}>← Regresar</button>
        <div style={styles.layout}>
          <div style={styles.main}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.category}>{report.category?.icon} {report.category?.name}</span>
                  <h1 style={styles.title}>{report.title}</h1>
                  <p style={styles.date}>{new Date(report.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              <p style={styles.desc}>{report.description}</p>
              <p style={styles.address}>📍 {report.location?.address}</p>
              {report.photos?.length > 0 && (
                <div style={styles.photos}>
                  {report.photos.map((p, i) => (
                    <img key={i} src={p.url} alt="foto" style={styles.photo} onClick={() => window.open(p.url)} />
                  ))}
                </div>
              )}
            </div>

            {coords?.lat && (
              <div style={styles.mapCard}>
                <h3 style={styles.cardSub}>Ubicación en el mapa</h3>
                <div style={styles.mapWrap}>
                  <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lng]} />
                  </MapContainer>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <h3 style={styles.cardSub}>Historial de actualizaciones ({report.comments?.length || 0})</h3>
              <div style={styles.comments}>
                {report.comments?.length === 0 ? (
                  <p style={styles.noComments}>Sin actualizaciones aún.</p>
                ) : (
                  report.comments.map((c) => (
                    <div key={c._id} style={{ ...styles.comment, ...(c.isStatusUpdate ? styles.statusComment : {}) }}>
                      <div style={styles.commentHeader}>
                        <strong>{c.author?.name}</strong>
                        <span style={styles.commentRole}>{c.author?.role === 'admin' ? '🛡️ Admin' : '👤 Ciudadano'}</span>
                        <span style={styles.commentDate}>{new Date(c.createdAt).toLocaleString('es-MX')}</span>
                      </div>
                      <p style={styles.commentText}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleComment} style={styles.commentForm}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Agrega un comentario o información adicional..."
                  rows={3} style={styles.commentInput}
                />
                <button type="submit" disabled={submitting || !comment.trim()} style={styles.commentBtn}>
                  {submitting ? 'Enviando...' : 'Enviar comentario'}
                </button>
              </form>
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h3 style={styles.cardSub}>Detalles del reporte</h3>
              <div style={styles.infoRow}><span>Estado</span><StatusBadge status={report.status} /></div>
              <div style={styles.infoRow}><span>Prioridad</span><span>{report.priority === 'high' ? '🔴 Alta' : report.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}</span></div>
              <div style={styles.infoRow}><span>Categoría</span><span>{report.category?.icon} {report.category?.name}</span></div>
              {report.assignedTo && (
                <div style={styles.infoRow}><span>Asignado a</span><span>{report.assignedTo.name}</span></div>
              )}
              {report.resolvedAt && (
                <div style={styles.infoRow}><span>Resuelto el</span><span>{new Date(report.resolvedAt).toLocaleDateString('es-MX')}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '24px' },
  back: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', padding: 0 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' },
  category: { color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' },
  title: { margin: 0, fontSize: '1.3rem', color: '#1e293b' },
  date: { color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' },
  desc: { color: '#374151', lineHeight: 1.7, margin: '0 0 12px' },
  address: { color: '#64748b', fontSize: '0.9rem' },
  photos: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' },
  photo: { width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' },
  mapCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  mapWrap: { height: '260px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  cardSub: { margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: 600 },
  comments: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  noComments: { color: '#94a3b8', fontSize: '0.9rem' },
  comment: { background: '#f8fafc', borderRadius: '8px', padding: '12px', borderLeft: '3px solid #e2e8f0' },
  statusComment: { background: '#eff6ff', borderLeft: '3px solid #3b82f6' },
  commentHeader: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' },
  commentRole: { background: '#e2e8f0', borderRadius: '4px', padding: '2px 6px', fontSize: '0.75rem', color: '#475569' },
  commentDate: { color: '#94a3b8', fontSize: '0.78rem', marginLeft: 'auto' },
  commentText: { margin: 0, color: '#374151', fontSize: '0.9rem' },
  commentForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  commentInput: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical', fontSize: '0.9rem' },
  commentBtn: { alignSelf: 'flex-end', padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  infoCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#374151' },
};
