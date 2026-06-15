export default function Spinner({ size = 40 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `4px solid rgba(255,255,255,0.08)`, borderTopColor: '#f5a623',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
