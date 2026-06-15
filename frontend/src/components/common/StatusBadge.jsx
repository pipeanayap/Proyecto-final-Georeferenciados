const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',   bg: 'rgba(245,158,11,0.15)', color: '#f5a623' },
  in_progress: { label: 'En proceso',  bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  resolved:    { label: 'Resuelto',    bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  rejected:    { label: 'Rechazado',   bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'rgba(255,255,255,0.08)', color: '#8e8e93' };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${cfg.color}22` }}>
      {cfg.label}
    </span>
  );
}
