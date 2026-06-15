import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';

const STATUSES = ['pending', 'in_progress', 'resolved', 'rejected'];

export default function AdminReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ status: '', comment: '', priority: '', assignedTo: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getReportById(id)
      .then(({ data }) => {
        setReport(data.data);
        setForm({ status: data.data.status, comment: '', priority: data.data.priority, assignedTo: data.data.assignedTo?._id || '' });
      })
      .catch(() => { toast.error('Reporte no encontrado'); navigate('/admin/reports'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.status !== report.status) payload.status = form.status;
      if (form.priority !== report.priority) payload.priority = form.priority;
      if (form.comment.trim()) payload.comment = form.comment.trim();
      const { data } = await adminApi.updateReport(id, payload);
      setReport(data.data);
      setForm((f) => ({ ...f, comment: '' }));
      toast.success('Reporte actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;
  if (!report) return null;

  const coords = report.location?.coordinates;

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <button onClick={() => navigate('/admin/reports')} style={styles.back}>← Regresar a reportes</button>
        <div style={styles.layout}>
          <div style={styles.main}>
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.categoryTag}>{report.category?.icon} {report.category?.name}</span>
                  <h1 style={styles.title}>{report.title}</h1>
                  <p style={styles.meta}>
                    Por <strong>{report.citizen?.name}</strong> ({report.citizen?.email}) — {new Date(report.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                  </p>
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
              <div style={styles.card}>
                <h3 style={styles.subTitle}>Ubicación</h3>
                <div style={{ height: '260px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lng]} />
                  </MapContainer>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <h3 style={styles.subTitle}>Historial ({report.comments?.length || 0})</h3>
              <div style={styles.timeline}>
                {report.comments?.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Sin actualizaciones aún.</p>
                ) : (
                  report.comments.map((c) => (
                    <div key={c._id} style={{ ...styles.comment, ...(c.isStatusUpdate ? styles.statusComment : {}) }}>
                      <div style={styles.commentHead}>
                        <strong>{c.author?.name}</strong>
                        <span style={styles.roleTag}>{c.author?.role === 'admin' ? '🛡️ Admin' : '👤'}</span>
                        <span style={styles.commentDate}>{new Date(c.createdAt).toLocaleString('es-MX')}</span>
                      </div>
                      {c.isStatusUpdate && (
                        <div style={styles.statusChange}>
                          {c.statusChanged?.from} → {c.statusChanged?.to}
                        </div>
                      )}
                      <p style={styles.commentText}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.card}>
              <h3 style={styles.subTitle}>Gestionar reporte</h3>
              <form onSubmit={handleUpdate} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Estado</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={styles.input}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Prioridad</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} style={styles.input}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Comentario (opcional)</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3} placeholder="Agrega una nota al ciudadano..."
                    style={styles.textarea}
                  />
                </div>
                <button type="submit" disabled={saving} style={styles.btn}>
                  {saving ? 'Guardando...' : 'Actualizar reporte'}
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.subTitle}>Info del ciudadano</h3>
              <p style={styles.infoLine}><strong>Nombre:</strong> {report.citizen?.name}</p>
              <p style={styles.infoLine}><strong>Email:</strong> {report.citizen?.email}</p>
              {report.citizen?.phone && <p style={styles.infoLine}><strong>Tel:</strong> {report.citizen?.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  back: { background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', padding: 0, fontWeight: 600 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' },
  card: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' },
  categoryTag: { color: '#636366', fontSize: '0.85rem', display: 'block', marginBottom: '4px' },
  title: { margin: 0, fontSize: '1.3rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px' },
  meta: { color: '#48484a', fontSize: '0.82rem', margin: '6px 0 0' },
  desc: { color: '#d1d1d6', lineHeight: 1.7, margin: '0 0 12px' },
  address: { color: '#636366', fontSize: '0.9rem' },
  photos: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' },
  photo: { width: '120px', height: '90px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' },
  subTitle: { margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#ffffff' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '12px' },
  comment: { background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', borderLeft: '3px solid rgba(255,255,255,0.08)' },
  statusComment: { background: 'rgba(245,166,35,0.05)', borderLeft: '3px solid #f5a623' },
  commentHead: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' },
  roleTag: { background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', color: '#8e8e93' },
  commentDate: { color: '#48484a', fontSize: '0.78rem', marginLeft: 'auto' },
  statusChange: { background: 'rgba(245,166,35,0.12)', color: '#f5a623', borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', display: 'inline-block', marginBottom: '6px', fontWeight: 600 },
  commentText: { margin: 0, color: '#d1d1d6', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#d1d1d6', letterSpacing: '0.3px' },
  input: { padding: '11px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  textarea: { padding: '11px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem', resize: 'vertical', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn: { padding: '11px', background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.2px', transition: 'all 0.2s ease' },
  infoLine: { margin: '0 0 8px', fontSize: '0.88rem', color: '#d1d1d6' },
};
