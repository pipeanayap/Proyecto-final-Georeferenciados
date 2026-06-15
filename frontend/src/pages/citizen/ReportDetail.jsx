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
  back: { background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', padding: 0, fontWeight: 600 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' },
  card: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' },
  category: { color: '#636366', fontSize: '0.85rem', display: 'block', marginBottom: '4px' },
  title: { margin: 0, fontSize: '1.3rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px' },
  date: { color: '#48484a', fontSize: '0.82rem', margin: '4px 0 0' },
  desc: { color: '#d1d1d6', lineHeight: 1.7, margin: '0 0 12px' },
  address: { color: '#636366', fontSize: '0.9rem' },
  photos: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' },
  photo: { width: '120px', height: '90px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' },
  mapCard: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' },
  mapWrap: { height: '260px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' },
  cardSub: { margin: '0 0 16px', fontSize: '1rem', color: '#ffffff', fontWeight: 700 },
  comments: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  noComments: { color: '#48484a', fontSize: '0.9rem' },
  comment: { background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', borderLeft: '3px solid rgba(255,255,255,0.08)' },
  statusComment: { background: 'rgba(245,166,35,0.05)', borderLeft: '3px solid #f5a623' },
  commentHeader: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' },
  commentRole: { background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', color: '#8e8e93' },
  commentDate: { color: '#48484a', fontSize: '0.78rem', marginLeft: 'auto' },
  commentText: { margin: 0, color: '#d1d1d6', fontSize: '0.9rem' },
  commentForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  commentInput: { padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', resize: 'vertical', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  commentBtn: { alignSelf: 'flex-end', padding: '9px 20px', background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.2s ease' },
  infoCard: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem', color: '#d1d1d6' },
};
