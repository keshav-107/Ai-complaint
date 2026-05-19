import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getComplaintById, updateComplaint, analyzeComplaint } from '../services/api';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const StatusBadge = ({ status }) => {
  const cls = { Pending: 'badge-pending', 'In Progress': 'badge-in-progress', Resolved: 'badge-resolved' }[status] || '';
  return <span className={`badge ${cls}`}>{status}</span>;
};

const urgencyClass = u => ({ Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[u] || '');

export default function ComplaintDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const isAdmin     = user?.role === 'admin';

  const [complaint, setComplaint] = useState(null);
  const [status,    setStatus]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getComplaintById(id);
        setComplaint(data.data);
        setStatus(data.data.status);
      } catch { setMsg({ type: 'error', text: 'Failed to load complaint.' }); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleStatusUpdate = async () => {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const { data } = await updateComplaint(id, { status });
      setComplaint(data.data);
      setMsg({ type: 'success', text: 'Status updated successfully.' });
    } catch { setMsg({ type: 'error', text: 'Update failed.' }); }
    finally { setSaving(false); }
  };

  // Admin only — full AI analysis
  const handleAnalyze = async () => {
    setAnalyzing(true); setMsg({ type: '', text: '' });
    try {
      const { data } = await analyzeComplaint({
        complaintId: id,
        title:       complaint.title,
        description: complaint.description,
        category:    complaint.category
      });
      setComplaint(prev => ({ ...prev, aiAnalysis: data.data }));
      setMsg({ type: 'success', text: 'AI analysis complete.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'AI analysis failed.' });
    } finally { setAnalyzing(false); }
  };

  const formatDate = d => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const ai = complaint?.aiAnalysis;
  const hasFullAnalysis = ai?.summary || ai?.autoResponse;
  const hasCategorization = ai?.urgency || ai?.department;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!complaint) return (
    <div className="page"><div className="empty"><div className="empty-icon">❌</div><h3>Complaint not found</h3><button className="btn btn-ghost" onClick={() => navigate('/complaints')}>← Back</button></div></div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>{complaint.title}</h1>
            <p>Submitted on {formatDate(complaint.createdAt)}</p>
          </div>
          <div className="flex-row">
            {isAdmin && <span className="badge badge-critical" style={{ background: 'rgba(99,102,241,.2)', color: 'var(--secondary)', borderColor: 'var(--primary)' }}>👑 Admin View</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>← Back</button>
          </div>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

      {/* Complaint Details */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="card-title">Complaint Details</span>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="detail-grid">
          <div className="detail-item"><label>Name</label><p>{complaint.name}</p></div>
          <div className="detail-item"><label>Email</label><p>{complaint.email}</p></div>
          <div className="detail-item"><label>Category</label><p>{complaint.category}</p></div>
          <div className="detail-item"><label>Location</label><p>📍 {complaint.location}</p></div>
          <div className="detail-item full"><label>Description</label><p>{complaint.description}</p></div>
        </div>

        <div className="divider" />

        {/* Status Update — Admin only */}
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Update Status:</label>
            <select id="status-select" className="form-select" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button id="save-status-btn" className="btn btn-success btn-sm" onClick={handleStatusUpdate}
              disabled={saving || status === complaint.status}>
              {saving ? 'Saving…' : 'Save Status'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--txt-2)', fontSize: '.875rem' }}>
            Current status: <StatusBadge status={complaint.status} />
          </p>
        )}
      </div>

      {/* AI Categorization (visible to everyone if set) */}
      {hasCategorization && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: '1.2rem' }}>🏷️</span>
            <span style={{ fontWeight: 700, color: 'var(--txt)' }}>AI Categorization</span>
            <span style={{ color: 'var(--txt-3)', fontSize: '.8rem' }}>— set during submission</span>
          </div>
          <div className="flex-row" style={{ flexWrap: 'wrap', gap: 20 }}>
            <div className="ai-item">
              <label>Urgency</label>
              <span className={`badge ${urgencyClass(ai.urgency)}`}>{ai.urgency}</span>
            </div>
            <div className="ai-item">
              <label>Recommended Department</label>
              <p>🏢 {ai.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Full AI Analysis — Admin only */}
      {isAdmin && (
        <div className="ai-panel">
          <div className="ai-panel-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <h3>Full AI Analysis <span style={{ color: 'var(--txt-3)', fontWeight: 400, fontSize: '.8rem' }}>(Admin only)</span></h3>
            </div>
            <button id="ai-analyze-btn" className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '⏳ Analyzing…' : hasFullAnalysis ? '🔄 Re-Analyze' : '🤖 Run Analysis'}
            </button>
          </div>

          {hasFullAnalysis ? (
            <div className="ai-grid">
              <div className="ai-item">
                <label>Urgency</label>
                <span className={`badge ${urgencyClass(ai.urgency)}`}>{ai.urgency}</span>
              </div>
              <div className="ai-item">
                <label>Department</label>
                <p>🏢 {ai.department}</p>
              </div>
              <div className="ai-item full">
                <label>AI Summary</label>
                <p>{ai.summary}</p>
              </div>
              <div className="ai-item full">
                <label>Auto-generated Response to User</label>
                <div className="ai-response">{ai.autoResponse}</div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--txt-2)', fontSize: '.875rem' }}>
              Click "Run Analysis" to generate a full AI summary and auto-response for this complaint.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
