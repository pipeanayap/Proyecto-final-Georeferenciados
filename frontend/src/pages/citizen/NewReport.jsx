import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { reportsApi, categoriesApi } from '../../services/api';
import Navbar from '../../components/common/Navbar';

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function NewReport() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState(null);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) { toast.warning('Máximo 3 fotos'); return; }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const onSubmit = async (data) => {
    if (!marker) { toast.warning('Selecciona una ubicación en el mapa'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('location', JSON.stringify({
        address: data.address,
        coordinates: { lat: marker.lat, lng: marker.lng },
      }));
      const files = fileRef.current?.files;
      if (files) {
        Array.from(files).forEach((f) => formData.append('photos', f));
      }
      await reportsApi.create(formData);
      toast.success('Reporte creado exitosamente');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h1 style={styles.title}>Nuevo Reporte de Incidencia</h1>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.grid}>
          <div style={styles.leftCol}>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Información del reporte</h2>
              <div style={styles.field}>
                <label style={styles.label}>Título *</label>
                <input
                  {...register('title', { required: 'Requerido', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })}
                  placeholder="Describe brevemente el problema" style={styles.input}
                />
                {errors.title && <span style={styles.err}>{errors.title.message}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Descripción *</label>
                <textarea
                  {...register('description', { required: 'Requerido', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
                  rows={4} placeholder="Describe el problema en detalle..." style={styles.textarea}
                />
                {errors.description && <span style={styles.err}>{errors.description.message}</span>}
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Categoría *</label>
                  <select {...register('category', { required: 'Requerido' })} style={styles.input}>
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                  {errors.category && <span style={styles.err}>{errors.category.message}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Prioridad</label>
                  <select {...register('priority')} style={styles.input}>
                    <option value="low">Baja</option>
                    <option value="medium" selected>Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fotos (máx. 3)</label>
                <input type="file" accept="image/*" multiple ref={fileRef} onChange={handleFiles} style={styles.fileInput} />
                {previews.length > 0 && (
                  <div style={styles.previews}>
                    {previews.map((p, i) => <img key={i} src={p} alt="preview" style={styles.preview} />)}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div style={styles.rightCol}>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Ubicación *</h2>
              <div style={styles.field}>
                <label style={styles.label}>Dirección o referencia</label>
                <input
                  {...register('address', { required: 'Requerido' })}
                  placeholder="Calle, colonia, referencia..." style={styles.input}
                />
                {errors.address && <span style={styles.err}>{errors.address.message}</span>}
              </div>
              <p style={styles.mapHint}>Haz clic en el mapa para marcar la ubicación exacta</p>
              <div style={styles.mapWrapper}>
                <MapContainer center={[19.4326, -99.1332]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onSelect={setMarker} />
                  {marker && <Marker position={[marker.lat, marker.lng]} />}
                </MapContainer>
              </div>
              {marker && (
                <p style={styles.coords}>
                  Coordenadas: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                </p>
              )}
            </section>
          </div>

          <div style={styles.submitRow}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>Cancelar</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 28px', fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.3px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  leftCol: {}, rightCol: {},
  section: { background: 'rgba(28, 28, 30, 0.95)', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' },
  sectionTitle: { margin: '0 0 22px', fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d1d6', marginBottom: '8px', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  textarea: { width: '100%', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  fileInput: { display: 'block', marginBottom: '8px', color: '#8e8e93', fontSize: '0.9rem' },
  previews: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' },
  preview: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' },
  mapHint: { color: '#636366', fontSize: '0.82rem', marginBottom: '8px' },
  mapWrapper: { height: '320px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' },
  coords: { color: '#f5a623', fontSize: '0.8rem', marginTop: '8px' },
  err: { color: '#ff6b6b', fontSize: '0.78rem', display: 'block', marginTop: '4px' },
  submitRow: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn: { padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.95rem', color: '#8e8e93', fontWeight: 500, transition: 'all 0.2s ease' },
  submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.2px', transition: 'all 0.2s ease' },
};
