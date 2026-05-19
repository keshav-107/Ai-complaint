import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaint, analyzeComplaint } from '../services/api';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

const StatusBadge = ({ status }) => {
  const cls = { Pending: 'badge-pending', 'In Progress': 'badge-in-progress', Resolved: 'badge-resolved' }[status] || '';
  return <span className={`badge ${cls}`}>{status}</span>;
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status,    setStatus]    = useState('');
  const [ai,        setAi]        = useState(null);
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
        if (data.data.aiAnalysis?.urgency) setAi(data.data.aiAnalysis);
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

  const handleAnalyze = async () => {
    setAnalyzing(true); setMsg({ type: '', text: '' });
    try {
      const { data } = await analyzeComplaint({
        complaintId: id,
        title:       complaint.title,
        description: complaint.description,
        category:    complaint.category
      });
      setAi(data.data);
      setComplaint(prev => ({ ...prev, aiAnalysis: data.data }));
    } catch { setMsg({ type: 'error', text: 'AI analysis failed.' }); }
    finally { setAnalyzing(false); }
  };

  const urgencyClass = u => ({ Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[u] || '');
  const formatDate   = d => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (!complaint && !loading) return (
    <div className="page"><div className="empty"><div className="empty-icon">❌</div><h3>Complaint not found</h3><button className="btn btn-ghost" onClick={() => navigate('/complaints')}>← Go Back</button></div></div>
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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/complaints')}>← Back</button>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

      {/* Complaint Details Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="card-title">Complaint Details</span>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{complaint.name}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{complaint.email}</p>
          </div>
          <div className="detail-item">
            <label>Category</label>
            <p>{complaint.category}</p>
          </div>
          <div className="detail-item">
            <label>Location</label>
            <p>📍 {complaint.location}</p>
          </div>
          <div className="detail-item full">
            <label>Description</label>
            <p>{complaint.description}</p>
          </div>
        </div>

        <div className="divider" />

        {/* Status Update */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Update Status:</label>
          <select id="status-select" className="form-select" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button id="save-status-btn" className="btn btn-success btn-sm" onClick={handleStatusUpdate} disabled={saving || status === complaint.status}>
            {saving ? 'Saving…' : 'Save Status'}
          </button>
          <button id="ai-analyze-btn" className="btn btn-ghost btn-sm" onClick={handleAnalyze} disabled={analyzing} style={{ marginLeft: 'auto' }}>
            {analyzing ? '🤖 Analyzing…' : '🤖 Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* AI Analysis Panel */}
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
              <label>Auto-generated Response to User</label>
              <div className="ai-response">{ai.autoResponse}</div>
            </div>
          </div>
        </div>
      )}

      {!ai && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--border-light)' }}>
          <p style={{ color: 'var(--txt-2)', marginBottom: 12 }}>No AI analysis yet for this complaint.</p>
          <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? '🤖 Analyzing…' : '🤖 Run AI Analysis Now'}
          </button>
        </div>
      )}
    </div>
  );
}
