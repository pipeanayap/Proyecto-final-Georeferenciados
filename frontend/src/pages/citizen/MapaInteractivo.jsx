import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { ubicacionesApi, figurasApi, reportsApi, adminApi, categoriesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';

// Custom SVG Icons
const locationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38">
      <path fill="#f5a623" stroke="#0e0e0e" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const reportIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38">
      <path fill="#ff6b6b" stroke="#0e0e0e" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

const tempIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38">
      <path fill="#a8a8a8" stroke="#0e0e0e" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function MapCenteringController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapEventsHandler({ mode, onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapaInteractivo() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [figures, setFigures] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  // Map settings
  const [center, setCenter] = useState([19.4326, -99.1332]);

  // UI Modes: 'view' | 'add_location' | 'draw_figure' | 'edit_report_location'
  const [mode, setMode] = useState('view');

  // New location temp state
  const [tempMarker, setTempMarker] = useState(null);
  const [newLocForm, setNewLocForm] = useState({ name: '', description: '' });

  // New figure drawing state
  const [vertices, setVertices] = useState([]);
  const [newFigName, setNewFigName] = useState('');

  // Edit location state
  const [editingLocId, setEditingLocId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Edit report state
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReportForm, setEditReportForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    address: '',
    lat: null,
    lng: null,
  });

  const loadData = () => {
    setLoading(true);
    const reportsPromise = user?.role === 'admin'
      ? adminApi.getReports({ limit: 100 })
      : reportsApi.getMine({ limit: 100 });

    Promise.all([
      ubicacionesApi.getAll(),
      figurasApi.getAll(),
      reportsPromise,
      categoriesApi.getAll(),
    ])
      .then(([locsRes, figsRes, reportsRes, catsRes]) => {
        setLocations(locsRes.data.data);
        setFigures(figsRes.data.data);
        setReports(reportsRes.data.reports || []);
        setCategories(catsRes.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error al cargar datos del mapa. Asegúrate de que el backend esté encendido.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle map click
  const handleMapClick = (latlng) => {
    if (mode === 'add_location') {
      setTempMarker({ lat: latlng.lat, lng: latlng.lng });
    } else if (mode === 'draw_figure') {
      setVertices((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
    } else if (mode === 'edit_report_location') {
      setEditReportForm((prev) => ({
        ...prev,
        lat: latlng.lat,
        lng: latlng.lng,
      }));
      toast.info('Nueva ubicación seleccionada para el reporte');
    }
  };

  // Create Location
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!tempMarker) {
      toast.warning('Por favor haz clic en el mapa para marcar la ubicación');
      return;
    }
    if (!newLocForm.name.trim() || !newLocForm.description.trim()) {
      toast.warning('Por favor completa todos los campos');
      return;
    }

    try {
      await ubicacionesApi.create({
        name: newLocForm.name,
        description: newLocForm.description,
        latitude: tempMarker.lat,
        longitude: tempMarker.lng,
      });
      toast.success('Ubicación guardada con éxito');
      setNewLocForm({ name: '', description: '' });
      setTempMarker(null);
      setMode('view');
      loadData();
    } catch (err) {
      toast.error('Error al registrar ubicación');
    }
  };

  // Update Location
  const handleUpdateLocation = async (id) => {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      toast.warning('Por favor completa todos los campos');
      return;
    }
    try {
      await ubicacionesApi.update(id, editForm);
      toast.success('Ubicación actualizada');
      setEditingLocId(null);
      loadData();
    } catch (err) {
      toast.error('Error al actualizar ubicación');
    }
  };

  // Delete Location
  const handleDeleteLocation = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta ubicación?')) return;
    try {
      await ubicacionesApi.delete(id);
      toast.success('Ubicación eliminada');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar ubicación');
    }
  };

  // Create Figure
  const handleSaveFigure = async (e) => {
    e.preventDefault();
    if (vertices.length < 3) {
      toast.warning('Una zona debe tener al menos 3 vértices');
      return;
    }
    if (!newFigName.trim()) {
      toast.warning('Por favor ingresa un nombre para la zona');
      return;
    }

    try {
      await figurasApi.create({
        name: newFigName,
        coordinates: vertices,
      });
      toast.success('Figura/Zona guardada con éxito');
      setNewFigName('');
      setVertices([]);
      setMode('view');
      loadData();
    } catch (err) {
      toast.error('Error al guardar zona');
    }
  };

  // Delete Figure
  const handleDeleteFigure = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta zona trazada?')) return;
    try {
      await figurasApi.delete(id);
      toast.success('Zona eliminada');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar zona');
    }
  };

  // Update Report (Title, Description, Category, Priority, Location)
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!editReportForm.title.trim() || !editReportForm.description.trim() || !editReportForm.address.trim()) {
      toast.warning('Por favor completa los campos requeridos');
      return;
    }
    try {
      await reportsApi.update(editingReportId, {
        title: editReportForm.title,
        description: editReportForm.description,
        category: editReportForm.category,
        priority: editReportForm.priority,
        location: {
          address: editReportForm.address,
          coordinates: { lat: editReportForm.lat, lng: editReportForm.lng },
        },
      });
      toast.success('Reporte de incidencia actualizado con éxito');
      setEditingReportId(null);
      setMode('view');
      loadData();
    } catch (err) {
      toast.error('Error al actualizar el reporte');
    }
  };

  // Delete Report
  const handleDeleteReport = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este reporte de incidencia?')) return;
    try {
      await reportsApi.delete(id);
      toast.success('Reporte de incidencia eliminado');
      loadData();
    } catch (err) {
      toast.error('Error al eliminar el reporte');
    }
  };

  // Filter locations by search term
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter reports by search term
  const filteredReports = reports.filter((rep) =>
    rep.title.toLowerCase().includes(search.toLowerCase()) ||
    rep.description.toLowerCase().includes(search.toLowerCase()) ||
    (rep.location?.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>📍 Mapa Interactivo</h2>
            <p style={styles.sidebarSub}>Visualización y edición de reportes, zonas y ubicaciones</p>
          </div>

          {/* Mode Selectors */}
          <div style={styles.modeRow}>
            <button
              onClick={() => {
                setMode('view');
                setTempMarker(null);
                setVertices([]);
                setEditingReportId(null);
              }}
              style={{ ...styles.modeBtn, ...(mode === 'view' ? styles.modeActive : {}) }}
            >
              Explorar
            </button>
            <button
              onClick={() => {
                setMode('add_location');
                setVertices([]);
                setEditingReportId(null);
              }}
              style={{ ...styles.modeBtn, ...(mode === 'add_location' ? styles.modeActive : {}) }}
            >
              + Ubicación
            </button>
            <button
              onClick={() => {
                setMode('draw_figure');
                setTempMarker(null);
                setEditingReportId(null);
              }}
              style={{ ...styles.modeBtn, ...(mode === 'draw_figure' ? styles.modeActive : {}) }}
            >
              📐 Trazar Zona
            </button>
          </div>

          {/* Mode Context Forms */}
          {mode === 'add_location' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Registrar Nueva Ubicación</h3>
              <p style={styles.instruction}>1. Haz clic en el mapa para colocar el marcador temporal gris.</p>
              {tempMarker && (
                <p style={styles.coordsText}>
                  Seleccionado: {tempMarker.lat.toFixed(5)}, {tempMarker.lng.toFixed(5)}
                </p>
              )}
              <form onSubmit={handleSaveLocation}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre</label>
                  <input
                    type="text"
                    value={newLocForm.name}
                    onChange={(e) => setNewLocForm({ ...newLocForm, name: e.target.value })}
                    placeholder="Ej. Entrada principal parque"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descripción</label>
                  <textarea
                    value={newLocForm.description}
                    onChange={(e) => setNewLocForm({ ...newLocForm, description: e.target.value })}
                    placeholder="Detalles..."
                    style={styles.textarea}
                  />
                </div>
                <div style={styles.btnRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setTempMarker(null);
                      setMode('view');
                    }}
                    style={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.saveBtn}>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === 'draw_figure' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Trazar Zona de Interés</h3>
              <p style={styles.instruction}>
                1. Haz clics consecutivos en el mapa para trazar el polígono. (Mínimo 3 vértices)
              </p>
              <p style={styles.infoText}>Vértices colocados: {vertices.length}</p>

              <form onSubmit={handleSaveFigure}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre de la Zona</label>
                  <input
                    type="text"
                    value={newFigName}
                    onChange={(e) => setNewFigName(e.target.value)}
                    placeholder="Ej. Sector con fallas"
                    style={styles.input}
                  />
                </div>
                <div style={styles.btnRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setVertices([]);
                      setMode('view');
                    }}
                    style={styles.cancelBtn}
                  >
                    Limpiar
                  </button>
                  <button type="submit" disabled={vertices.length < 3} style={styles.saveBtn}>
                    Guardar Zona
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingReportId && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Editar Reporte de Incidencia</h3>
              <p style={styles.instruction}>
                Puedes modificar los datos del reporte e incluso hacer clic en el mapa para reubicarlo.
              </p>
              {editReportForm.lat && (
                <p style={styles.coordsText}>
                  Ubicación: {editReportForm.lat.toFixed(5)}, {editReportForm.lng.toFixed(5)}
                </p>
              )}
              <form onSubmit={handleUpdateReport}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Título</label>
                  <input
                    type="text"
                    value={editReportForm.title}
                    onChange={(e) => setEditReportForm({ ...editReportForm, title: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descripción</label>
                  <textarea
                    value={editReportForm.description}
                    onChange={(e) => setEditReportForm({ ...editReportForm, description: e.target.value })}
                    style={styles.textarea}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Dirección / Referencia</label>
                  <input
                    type="text"
                    value={editReportForm.address}
                    onChange={(e) => setEditReportForm({ ...editReportForm, address: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoría</label>
                  <select
                    value={editReportForm.category}
                    onChange={(e) => setEditReportForm({ ...editReportForm, category: e.target.value })}
                    style={styles.input}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prioridad</label>
                  <select
                    value={editReportForm.priority}
                    onChange={(e) => setEditReportForm({ ...editReportForm, priority: e.target.value })}
                    style={styles.input}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div style={styles.btnRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReportId(null);
                      setMode('view');
                    }}
                    style={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.saveBtn}>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Box */}
          <div style={styles.searchSection}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Buscar ubicaciones..."
              style={styles.searchInput}
            />
          </div>

          {/* Table / List of Registered Locations (Real time) */}
          <div style={styles.tableSection}>
            <h3 style={styles.sectionHeader}>Ubicaciones en el Mapa ({filteredLocations.length})</h3>
            <div style={styles.scrollableTableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Descripción</th>
                    <th style={styles.th}>Latitud</th>
                    <th style={styles.th}>Longitud</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((loc) => (
                    <tr key={loc._id} style={styles.tr}>
                      <td style={styles.td}><strong>{loc.name}</strong></td>
                      <td style={styles.td}>{loc.description}</td>
                      <td style={styles.td}>{loc.latitude.toFixed(5)}</td>
                      <td style={styles.td}>{loc.longitude.toFixed(5)}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setCenter([loc.latitude, loc.longitude])}
                          style={styles.centerBtn}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>
                        No hay ubicaciones registradas con ese nombre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table / List of Incident Reports (Real time) */}
          <div style={{ ...styles.tableSection, marginTop: '14px' }}>
            <h3 style={styles.sectionHeader}>Reportes de Incidencias ({filteredReports.length})</h3>
            <div style={styles.scrollableTableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Ubicación / Ref</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((rep) => {
                    const repCoords = rep.location?.coordinates;
                    return (
                      <tr key={rep._id} style={styles.tr}>
                        <td style={styles.td}><strong>{rep.title}</strong></td>
                        <td style={styles.td}>{rep.location?.address}</td>
                        <td style={styles.td}>
                          <span style={{
                            color: rep.status === 'resolved' ? '#4ade80' : rep.status === 'pending' ? '#f5a623' : '#60a5fa',
                            fontWeight: 600
                          }}>
                            {rep.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {repCoords?.lat && repCoords?.lng ? (
                            <button
                              onClick={() => setCenter([repCoords.lat, repCoords.lng])}
                              style={styles.centerBtn}
                            >
                              Ver
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="4" style={styles.emptyTd}>
                        No hay reportes correspondientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* List of Zones */}
          <div style={styles.zonesSection}>
            <h3 style={styles.sectionHeader}>Zonas Trazadas ({figures.length})</h3>
            <div style={styles.zonesList}>
              {figures.map((fig) => (
                <div key={fig._id} style={styles.zoneItem}>
                  <span>📐 {fig.name}</span>
                  <button
                    onClick={() => handleDeleteFigure(fig._id)}
                    style={styles.deleteZoneBtn}
                  >
                    Borrar
                  </button>
                </div>
              ))}
              {figures.length === 0 && <p style={styles.emptyText}>No hay zonas guardadas aún.</p>}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div style={styles.mapArea}>
          {loading ? (
            <div style={styles.mapLoading}>
              <Spinner />
              <p style={{ color: '#fff', marginTop: '12px' }}>Cargando mapa...</p>
            </div>
          ) : (
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              <MapCenteringController center={center} />
              <MapEventsHandler mode={mode} onMapClick={handleMapClick} />

              {/* Saved Locations Markers */}
              {locations.map((loc) => (
                <Marker
                  key={loc._id}
                  position={[loc.latitude, loc.longitude]}
                  icon={locationIcon}
                >
                  <Popup>
                    {editingLocId === loc._id ? (
                      <div style={styles.popupForm}>
                        <h4 style={styles.popupTitle}>Editar Ubicación</h4>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={styles.popupInput}
                          placeholder="Nombre"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          style={styles.popupTextarea}
                          placeholder="Descripción"
                        />
                        <div style={styles.popupBtnRow}>
                          <button
                            onClick={() => setEditingLocId(null)}
                            style={styles.popupCancelBtn}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleUpdateLocation(loc._id)}
                            style={styles.popupSaveBtn}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.popupDetails}>
                        <h3 style={styles.popupName}>{loc.name}</h3>
                        <p style={styles.popupDesc}>{loc.description}</p>
                        <p style={styles.popupCoords}>
                          Lat: {loc.latitude.toFixed(5)} | Lng: {loc.longitude.toFixed(5)}
                        </p>
                        <div style={styles.popupBtnRow}>
                          <button
                            onClick={() => {
                              setEditingLocId(loc._id);
                              setEditForm({ name: loc.name, description: loc.description });
                            }}
                            style={styles.popupEditBtn}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc._id)}
                            style={styles.popupDeleteBtn}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}

              {/* Saved Incident Reports Markers */}
              {reports.map((rep) => {
                const repCoords = rep.location?.coordinates;
                if (!repCoords?.lat || !repCoords?.lng) return null;
                return (
                  <Marker
                    key={rep._id}
                    position={[repCoords.lat, repCoords.lng]}
                    icon={reportIcon}
                  >
                    <Popup>
                      <div style={styles.popupDetails}>
                        <span style={styles.popupLabel}>⚠️ Reporte de Incidencia</span>
                        <h3 style={styles.popupName}>{rep.title}</h3>
                        <p style={styles.popupDesc}>{rep.description}</p>
                        <p style={styles.popupDesc}>📍 {rep.location?.address}</p>
                        <p style={styles.popupCoords}>Estado: <strong>{rep.status}</strong></p>
                        <div style={styles.popupBtnRow}>
                          <button
                            onClick={() => {
                              setEditingReportId(rep._id);
                              setMode('edit_report_location');
                              setEditReportForm({
                                title: rep.title,
                                description: rep.description,
                                category: rep.category?._id || '',
                                priority: rep.priority || 'medium',
                                address: rep.location?.address || '',
                                lat: repCoords.lat,
                                lng: repCoords.lng,
                              });
                            }}
                            style={styles.popupEditBtn}
                          >
                            Editar Reporte
                          </button>
                          <button
                            onClick={() => handleDeleteReport(rep._id)}
                            style={styles.popupDeleteBtn}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Temporary Marker (when adding location) */}
              {mode === 'add_location' && tempMarker && (
                <Marker position={[tempMarker.lat, tempMarker.lng]} icon={tempIcon}>
                  <Popup>Ubicación nueva temporal</Popup>
                </Marker>
              )}

              {/* Saved Zones (Figures) */}
              {figures.map((fig) => (
                <Polygon
                  key={fig._id}
                  positions={fig.coordinates}
                  pathOptions={{ color: '#f5a623', fillColor: '#f5a623', fillOpacity: 0.15 }}
                >
                  <Popup>
                    <div style={styles.popupDetails}>
                      <h4 style={styles.popupName}>📐 {fig.name}</h4>
                      <p style={styles.popupDesc}>Zona georeferenciada guardada.</p>
                      <button
                        onClick={() => handleDeleteFigure(fig._id)}
                        style={styles.popupDeleteBtn}
                      >
                        Eliminar Zona
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              ))}

              {/* Render Current Drawn Line/Polygon Vertices */}
              {mode === 'draw_figure' && vertices.length > 0 && (
                <>
                  {vertices.map((v, idx) => (
                    <Marker key={idx} position={[v.lat, v.lng]} icon={tempIcon} />
                  ))}
                  {vertices.length === 1 && (
                    <Marker position={[vertices[0].lat, vertices[0].lng]} icon={tempIcon} />
                  )}
                  {vertices.length > 1 && (
                    <Polyline
                      positions={vertices}
                      pathOptions={{ color: '#a8a8a8', dashArray: '5, 5' }}
                    />
                  )}
                  {vertices.length > 2 && (
                    <Polygon
                      positions={vertices}
                      pathOptions={{ color: '#a8a8a8', fillColor: '#a8a8a8', fillOpacity: 0.1 }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    width: '100%',
    overflow: 'hidden',
    background: '#0e0e0e',
  },
  sidebar: {
    width: '400px',
    background: '#141414',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '20px',
  },
  sidebarHeader: {
    marginBottom: '20px',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#ffffff',
  },
  sidebarSub: {
    margin: '4px 0 0',
    fontSize: '0.8rem',
    color: '#636366',
  },
  modeRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '18px',
  },
  modeBtn: {
    flex: 1,
    padding: '9px 4px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    color: '#8e8e93',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  modeActive: {
    borderColor: '#f5a623',
    background: 'rgba(245,166,35,0.1)',
    color: '#f5a623',
  },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '18px',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: '0.9rem',
    color: '#ffffff',
    fontWeight: 700,
  },
  instruction: {
    margin: '0 0 10px',
    fontSize: '0.75rem',
    color: '#8e8e93',
    lineHeight: 1.4,
  },
  coordsText: {
    margin: '0 0 12px',
    fontSize: '0.75rem',
    color: '#f5a623',
    fontWeight: 600,
  },
  infoText: {
    margin: '0 0 12px',
    fontSize: '0.75rem',
    color: '#d1d1d6',
  },
  formGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#8e8e93',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'none',
    height: '60px',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: 'none',
    borderRadius: '8px',
    color: '#8e8e93',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  saveBtn: {
    padding: '8px 14px',
    background: '#f5a623',
    color: '#0e0e0e',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  searchSection: {
    marginBottom: '18px',
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
  },
  tableSection: {
    flex: 1,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '18px',
  },
  sectionHeader: {
    margin: '0 0 10px',
    fontSize: '0.9rem',
    color: '#ffffff',
    fontWeight: 700,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '8px',
  },
  scrollableTableWrapper: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.01)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.78rem',
    color: '#d1d1d6',
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    background: '#1a1a1a',
    color: '#8e8e93',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  td: {
    padding: '8px 10px',
    verticalAlign: 'top',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyTd: {
    textAlign: 'center',
    padding: '20px',
    color: '#636366',
  },
  centerBtn: {
    padding: '3px 8px',
    background: 'rgba(245,166,35,0.12)',
    color: '#f5a623',
    border: '1px solid rgba(245,166,35,0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  zonesSection: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '14px',
  },
  zonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '130px',
    overflowY: 'auto',
  },
  zoneItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#d1d1d6',
  },
  deleteZoneBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  emptyText: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#636366',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0e0e0e',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  popupDetails: {
    minWidth: '180px',
    color: '#fff',
  },
  popupLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#ff6b6b',
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  popupName: {
    margin: '0 0 6px',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
  },
  popupDesc: {
    margin: '0 0 10px',
    fontSize: '0.8rem',
    color: '#ccc',
    lineHeight: 1.3,
  },
  popupCoords: {
    margin: '0 0 12px',
    fontSize: '0.7rem',
    color: '#f5a623',
  },
  popupBtnRow: {
    display: 'flex',
    gap: '6px',
  },
  popupEditBtn: {
    flex: 1,
    padding: '4px 8px',
    background: '#f5a623',
    color: '#0e0e0e',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 700,
    textAlign: 'center',
  },
  popupDeleteBtn: {
    flex: 1,
    padding: '4px 8px',
    background: 'rgba(239,68,68,0.15)',
    color: '#ff6b6b',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  popupForm: {
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  popupTitle: {
    margin: '0 0 2px',
    fontSize: '0.88rem',
    color: '#fff',
    fontWeight: 700,
  },
  popupInput: {
    width: '100%',
    padding: '5px 8px',
    background: '#2c2c2e',
    border: '1px solid #3a3a3c',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.8rem',
    outline: 'none',
  },
  popupTextarea: {
    width: '100%',
    padding: '5px 8px',
    background: '#2c2c2e',
    border: '1px solid #3a3a3c',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.8rem',
    outline: 'none',
    resize: 'none',
    height: '45px',
  },
  popupCancelBtn: {
    flex: 1,
    padding: '4px 8px',
    background: '#3a3a3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  popupSaveBtn: {
    flex: 1,
    padding: '4px 8px',
    background: '#f5a623',
    color: '#0e0e0e',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
};
