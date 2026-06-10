const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',   bg: '#fef3c7', color: '#92400e' },
  in_progress: { label: 'En proceso',  bg: '#dbeafe', color: '#1e40af' },
  resolved:    { label: 'Resuelto',    bg: '#dcfce7', color: '#166534' },
  rejected:    { label: 'Rechazado',   bg: '#fee2e2', color: '#991b1b' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}
