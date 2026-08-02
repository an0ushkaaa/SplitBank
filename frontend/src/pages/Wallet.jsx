import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import TransactionRow from '../components/TransactionRow';

const MONO = "'Space Mono', monospace";
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
    </div>
  );
}

export default function Wallet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [wallet, setWallet] = useState(location.state?.wallet || null);
  const [txns, setTxns] = useState([]);
  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [targetId, setTargetId] = useState('');
  const [wallets, setWallets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchWallet(); fetchTxns(); fetchWallets(); }, [id]);
  useEffect(() => { fetchTxns(); }, [filter]);

  const fetchWallet = async () => {
    const res = await client.get(`/wallets/${id}`);
    setWallet(res.data);
  };

  const fetchWallets = async () => {
    const res = await client.get('/wallets');
    setWallets((res.data || []).filter(w => w.id !== id));
  };

  const fetchTxns = async () => {
    const url = filter === 'flagged' ? `/wallets/${id}/audit?flagged=true` : `/wallets/${id}/audit`;
    const res = await client.get(url);
    setTxns(res.data);
  };

  const submit = async () => {
    const a = parseFloat(amount);
    if (modal !== 'invite' && (!a || a <= 0)) { setError('Enter a valid amount'); return; }
    setError(''); setLoading(true);
    try {
      if (modal === 'deposit') await client.post(`/wallets/${id}/deposit`, { amount: a, note: note || null });
      if (modal === 'spend') await client.post(`/wallets/${id}/spend`, { amount: a, note: note || null });
      if (modal === 'transfer') await client.post(`/wallets/${id}/transfer`, { amount: a, target_wallet_id: targetId, note: note || null });
      if (modal === 'invite') await client.post(`/wallets/${id}/invite`, { email: amount });
      setAmount(''); setNote(''); setTargetId(''); setModal(null);
      fetchWallet(); fetchTxns();
    } catch (e) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  if (!wallet) return <div style={{ padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar onLogout={logout} />
      <div style={{ marginLeft: '196px', flex: 1, padding: '36px 44px', maxWidth: '740px' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '28px', padding: 0, cursor: 'pointer' }}>
          ← Back to wallets
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>
            {wallet.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: '50px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1 }}>
            {fmt(wallet.balance)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>live balance</div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['deposit', 'spend', 'transfer', 'invite'].map(a => (
            <button key={a} onClick={() => setModal(modal === a ? null : a)}
              style={{ padding: '8px 18px', background: modal === a ? 'var(--text-primary)' : 'none', color: modal === a ? 'var(--surface-2)' : 'var(--text-primary)', border: modal === a ? '0.5px solid var(--text-primary)' : '0.5px solid var(--border-strong)', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.1s' }}>
              {a}
            </button>
          ))}
        </div>

        {modal && (
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>{modal}</div>
            {modal !== 'invite' ? (
              <>
                <Field label="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" />
                {modal === 'transfer' && (
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Target Wallet</label>
                    <select
                      value={targetId}
                      onChange={e => setTargetId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)', color: targetId ? 'var(--text-primary)' : 'var(--text-muted)', appearance: 'none' }}
                    >
                      <option value="">Select a wallet…</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Field label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="What's this for?" />
              </>
            ) : (
              <Field label="Email" value={amount} onChange={e => setAmount(e.target.value)} placeholder="friend@example.com" type="email" />
            )}
            {error && <div style={{ fontSize: '12px', color: 'var(--text-danger)', marginBottom: '12px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={submit} disabled={loading}
                style={{ padding: '8px 18px', background: 'var(--text-primary)', color: 'var(--surface-2)', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500, opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : 'Confirm'}
              </button>
              <button onClick={() => { setModal(null); setAmount(''); setNote(''); setError(''); }}
                style={{ padding: '8px 14px', background: 'none', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>Transactions</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'flagged'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '3px 10px', border: filter === f ? '0.5px solid var(--text-primary)' : '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: filter === f ? 'var(--text-primary)' : 'none', color: filter === f ? 'var(--surface-2)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 500, textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-2)' }}>
            {txns.length === 0
              ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No transactions yet</div>
              : txns.map((txn, i) => <TransactionRow key={txn.id} txn={txn} isLast={i === txns.length - 1} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}