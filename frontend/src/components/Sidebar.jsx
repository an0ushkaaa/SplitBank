import { useNavigate } from 'react-router-dom';
const MONO = "'Space Mono', monospace";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: '196px', position: 'fixed', top: 0, left: 0, bottom: 0, background: 'var(--surface-2)', borderRight: '0.5px solid var(--border)', padding: '20px 10px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: 'var(--text-primary)', marginBottom: '24px', paddingLeft: '8px' }}>
        SPLITBANK
      </div>
      <button onClick={() => navigate('/dashboard')} style={{ width: '100%', textAlign: 'left', padding: '7px 10px', background: 'var(--surface-1)', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
        Wallets
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '14px', paddingLeft: '8px' }}>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--text-muted)', padding: 0 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}