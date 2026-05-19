import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint, categorizeComplaint } from '../services/api';

const CATEGORIES = ['Water Supply', 'Electricity', 'Sanitation', 'Roads', 'Public Safety', 'Healthcare', 'Other'];
const URGENCIES  = ['Low', 'Medium', 'High', 'Critical'];
const EMPTY      = { name: '', email: '', title: '', description: '', category: '', location: '' };

const urgencyClass = u => ({ Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[u] || '');

export default function RegisterComplaint() {
  const navigate = useNavigate();
  const [form,       setForm]       = useState(EMPTY);
  const [aiResult,   setAiResult]   = useState(null);   // { urgency, department }
  const [urgency,    setUrgency]    = useState('');      // editable override
  const [department, setDepartment] = useState('');      // editable override
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [analyzing,  setAnalyzing]  = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // AI categorize — available as soon as title + description + category are filled
  const canCategorize = form.title.trim() && form.description.trim() && form.category;

  const handleCategorize = async () => {
    setAnalyzing(true); setError('');
    try {
      const { data } = await categorizeComplaint({
        title:       form.title,
        description: form.description,
        category:    form.category
      });
      setAiResult(data.data);
      setUrgency(data.data.urgency);
      setDepartment(data.data.department);
    } catch (err) {
      setError(err.response?.data?.message || 'AI categorization failed.');
    } finally { setAnalyzing(false); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      // Include AI categorization result (user-confirmed or overridden)
      const aiAnalysis = urgency && department
        ? { urgency, department, summary: null, autoResponse: null }
        : undefined;

      await createComplaint({ ...form, aiAnalysis });
      setSuccess('✅ Complaint submitted successfully!');
      setTimeout(() => navigate('/complaints'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Register Complaint</h1>
            <p>Fill in the details — use AI to auto-detect urgency &amp; department</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>← Back</button>
        </div>
      </div>

      <div className="card">
        {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name + Email */}
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

          {/* Title */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Complaint Title</label>
            <input id="c-title" name="title" className="form-input" placeholder="e.g. Water Leakage Issue"
              value={form.title} onChange={handleChange} required />
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Description</label>
            <textarea id="c-description" name="description" className="form-textarea"
              placeholder="Describe the issue in detail…" value={form.description} onChange={handleChange} required />
          </div>

          {/* Category + Location */}
          <div className="form-grid" style={{ marginBottom: 18 }}>
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

          {/* AI Categorize Panel */}
          {canCategorize && (
            <div style={{ marginBottom: 24, padding: '18px 20px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: aiResult ? 16 : 0, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.9rem' }}>🤖 AI Auto-Categorization</p>
                  <p style={{ color: 'var(--txt-2)', fontSize: '.8rem' }}>Detect urgency &amp; department from your description</p>
                </div>
                <button id="c-categorize" type="button" className="btn btn-ghost btn-sm"
                  onClick={handleCategorize} disabled={analyzing}>
                  {analyzing ? '⏳ Analyzing…' : aiResult ? '🔄 Re-Analyze' : '🤖 Categorize'}
                </button>
              </div>

              {/* Editable results */}
              {aiResult && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Urgency &nbsp;
                      {urgency && <span className={`badge ${urgencyClass(urgency)}`} style={{ textTransform: 'none' }}>{urgency}</span>}
                    </label>
                    <select id="c-urgency" className="form-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
                      {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <span className="error-text" style={{ color: 'var(--txt-3)' }}>✏️ AI suggested — change if needed</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input id="c-department" className="form-input" value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Water Supply Department" />
                    <span className="error-text" style={{ color: 'var(--txt-3)' }}>✏️ AI suggested — change if needed</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button id="c-submit" type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
