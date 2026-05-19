import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function LoginPage() {
  const { authLogin } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await login(form);
      authLogin(data.user, data.token);
      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🛡️ ComplaintAI</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="login-email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" name="password" type="password" className="form-input"
              placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
