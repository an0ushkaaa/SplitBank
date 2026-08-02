const MONO = "'Space Mono', monospace";
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const sym = { deposit: '+', spend: '−', transfer: '→' };

export default function TransactionRow({ txn, isLast }) {
  const time = new Date(txn.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: isLast ? 'none' : '0.5px solid var(--border)', borderLeft: txn.flagged ? '3px solid var(--border-danger)' : '3px solid transparent', background: txn.flagged ? 'var(--bg-danger)' : 'transparent' }}>
      <div style={{ width: '64px', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {txn.type}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: txn.flagged ? 'var(--text-danger)' : 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '7px' }}>
          {String(txn.initiated_by).split('-')[0]}
          {txn.flagged && <span style={{ fontSize: '9px', background: 'var(--text-danger)', color: '#fff', borderRadius: '3px', padding: '2px 5px', fontWeight: 700 }}>FLAGGED</span>}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{txn.note || '—'}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 700, color: txn.flagged ? 'var(--text-danger)' : 'var(--text-primary)' }}>
          {sym[txn.type]} {fmt(txn.amount)}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{time}</div>
      </div>
    </div>
  );
}