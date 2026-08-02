import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const MONO = "'Space Mono', monospace";

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'register') {
        await client.post('/auth/register', { name, email, password });
        setMode('login');
        setError('Account created — sign in now.');
        return;
      }
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);
      const res = await client.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-primary)' }}>SPLITBANK</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '7px' }}>shared wallets, simplified</div>
      </div>

      <div style={{ width: '100%', maxWidth: '320px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', marginBottom: '24px' }}>
          {[['login', 'Sign in'], ['register', 'Register']].map(([m, lbl]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, paddingBottom: '12px', background: 'none', border: 'none', fontSize: '13px', fontWeight: mode === m ? 500 : 400, color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: mode === m ? '2px solid var(--text-primary)' : '2px solid transparent', marginBottom: '-0.5px' }}>
              {lbl}
            </button>
          ))}
        </div>

        {mode === 'register' && <Field label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />}
        <Field label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <Field label="Password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />

        {error && <div style={{ fontSize: '12px', color: error.includes('created') ? 'var(--text-secondary)' : 'var(--text-danger)', marginTop: '12px' }}>{error}</div>}

        <button onClick={submit} disabled={loading}
          style={{ width: '100%', marginTop: '16px', padding: '11px', background: 'var(--text-primary)', color: 'var(--surface-2)', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500, opacity: loading ? 0.7 : 1 }}>
          {loading ? '...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
        </button>
      </div>
    </div>
  );
}