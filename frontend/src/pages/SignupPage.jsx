import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup } from '../services/api';

export default function SignupPage() {
  const { authLogin } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await signup(form);
      authLogin(data.user, data.token);
      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🛡️ ComplaintAI</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="signup-name" name="name" type="text" className="form-input"
              placeholder="Rahul Kumar" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="signup-email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="signup-password" name="password" type="password" className="form-input"
              placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <button id="signup-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
