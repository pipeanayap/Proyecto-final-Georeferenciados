export default function Spinner({ size = 40 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `4px solid #e2e8f0`, borderTopColor: '#3b82f6',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
