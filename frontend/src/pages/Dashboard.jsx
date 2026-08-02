import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';

export default function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/wallets').then(res => {
      setWallets(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    const res = await client.post('/wallets', { name: newName.trim() });
    setWallets([...wallets, res.data]);
    setNewName(''); setShowNew(false);
  };

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar onLogout={logout} />
      <div style={{ marginLeft: '196px', flex: 1, padding: '36px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 500 }}>Wallets</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              {loading ? '...' : `${wallets.length} active`}
            </p>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--surface-2)', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500 }}>
            + New wallet
          </button>
        </div>

        {showNew && (
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '18px', display: 'flex', gap: '8px' }}>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="Wallet name..."
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
            <button onClick={create} style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--surface-2)', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px' }}>Create</button>
            <button onClick={() => setShowNew(false)} style={{ padding: '8px 12px', background: 'none', border: '0.5px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</button>
          </div>
        )}

        {loading
          ? <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</div>
          : wallets.length === 0
          ? <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No wallets yet. Create one to get started.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {wallets.map(w => <WalletCard key={w.id} wallet={w} onClick={() => navigate(`/wallet/${w.id}`, { state: { wallet: w } })} />)}
            </div>
        }
      </div>
    </div>
  );
}