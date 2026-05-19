import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint, analyzeComplaint } from '../services/api';

const CATEGORIES = ['Water Supply', 'Electricity', 'Sanitation', 'Roads', 'Public Safety', 'Healthcare', 'Other'];

const EMPTY = { name: '', email: '', title: '', description: '', category: '', location: '' };

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const [form,      setForm]      = useState(EMPTY);
  const [ai,        setAi]        = useState(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedId,   setSavedId]   = useState(null);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { data } = await createComplaint(form);
      setSavedId(data.data._id);
      setSuccess('✅ Complaint submitted! You can now run AI analysis below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!form.title || !form.description || !form.category) {
      setError('Fill in Title, Description, and Category before analyzing.'); return;
    }
    setAnalyzing(true); setError('');
    try {
      const { data } = await analyzeComplaint({ complaintId: savedId, title: form.title, description: form.description, category: form.category });
      setAi(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed.');
    } finally { setAnalyzing(false); }
  };

  const urgencyClass = u => ({ Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[u] || '');

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Register Complaint</h1>
            <p>Submit a new complaint for review and AI analysis</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>← Back</button>
        </div>
      </div>

      <div className="card">
        {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: 18 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="c-name" name="name" className="form-input" placeholder="Rahul Kumar"
                value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="c-email" name="email" type="email" className="form-input" placeholder="rahul@gmail.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Complaint Title</label>
            <input id="c-title" name="title" className="form-input" placeholder="e.g. Water Leakage Issue"
              value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Description</label>
            <textarea id="c-description" name="description" className="form-textarea"
              placeholder="Describe the issue in detail…" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-grid" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select id="c-category" name="category" className="form-select" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input id="c-location" name="location" className="form-input" placeholder="e.g. Ghaziabad"
                value={form.location} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex-row">
            <button id="c-submit" type="submit" className="btn btn-primary" disabled={loading || !!savedId}>
              {loading ? 'Submitting…' : savedId ? '✅ Submitted' : 'Submit Complaint'}
            </button>
            <button id="c-analyze" type="button" className="btn btn-ghost" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '🤖 Analyzing…' : '🤖 AI Analyze'}
            </button>
          </div>
        </form>

        {/* AI Result Panel */}
        {ai && (
          <div className="ai-panel">
            <div className="ai-panel-header">
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <h3>AI Analysis Result</h3>
            </div>
            <div className="ai-grid">
              <div className="ai-item">
                <label>Urgency Level</label>
                <span className={`badge ${urgencyClass(ai.urgency)}`}>{ai.urgency}</span>
              </div>
              <div className="ai-item">
                <label>Recommended Department</label>
                <p>🏢 {ai.department}</p>
              </div>
              <div className="ai-item full">
                <label>AI Summary</label>
                <p>{ai.summary}</p>
              </div>
              <div className="ai-item full">
                <label>Auto-generated Response</label>
                <div className="ai-response">{ai.autoResponse}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
