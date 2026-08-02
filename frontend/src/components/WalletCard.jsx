import { useState } from 'react';
const MONO = "'Space Mono', monospace";
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function WalletCard({ wallet, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'var(--surface-1)' : 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'background 0.1s' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500 }}>
        {wallet.name}
      </div>
      <div style={{ fontFamily: MONO, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '16px' }}>
        {fmt(wallet.balance)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>shared wallet</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>→</span>
      </div>
    </div>
  );
}