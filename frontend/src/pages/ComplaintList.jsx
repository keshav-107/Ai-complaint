import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComplaints, deleteComplaint, searchByLocation } from '../services/api';

const CATEGORIES = ['', 'Water Supply', 'Electricity', 'Sanitation', 'Roads', 'Public Safety', 'Healthcare', 'Other'];
const STATUSES   = ['', 'Pending', 'In Progress', 'Resolved'];

const StatusBadge = ({ status }) => {
  const cls = { Pending: 'badge-pending', 'In Progress': 'badge-in-progress', Resolved: 'badge-resolved' }[status] || '';
  return <span className={`badge ${cls}`}>{status}</span>;
};

const UrgencyBadge = ({ u }) => {
  if (!u) return <span className="text-muted" style={{ fontSize: '.8rem' }}>—</span>;
  const cls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' }[u] || '';
  return <span className={`badge ${cls}`}>{u}</span>;
};

export default function ComplaintList() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState('');
  const [status,     setStatus]     = useState('');
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let res;
      if (search.trim()) {
        res = await searchByLocation(search.trim());
      } else {
        const params = {};
        if (category) params.category = category;
        if (status)   params.status   = status;
        res = await getComplaints(params);
      }
      setComplaints(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints.');
    } finally { setLoading(false); }
  }, [category, status, search]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this complaint?')) return;
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c._id !== id));
    } catch { alert('Delete failed.'); }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>All Complaints</h1>
            <p>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</p>
          </div>
          <button id="new-complaint-btn" className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
            + New Complaint
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input id="search-location" className="form-input" placeholder="Search by location…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="filter-category" className="form-select" value={category} onChange={e => setCategory(e.target.value)} disabled={!!search}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        <select id="filter-status" className="form-select" value={status} onChange={e => setStatus(e.target.value)} disabled={!!search}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        {(search || category || status) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h3>No complaints found</h3>
          <p>Try adjusting filters or <button className="btn btn-ghost btn-sm" style={{ display: 'inline-flex' }} onClick={() => navigate('/complaints/new')}>submit a new one</button></p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} onClick={() => navigate(`/complaints/${c._id}`)}>
                  <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td><span style={{ fontSize: '.8rem', color: 'var(--txt-2)' }}>{c.category}</span></td>
                  <td style={{ color: 'var(--txt-2)', fontSize: '.85rem' }}>📍 {c.location}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><UrgencyBadge u={c.aiAnalysis?.urgency} /></td>
                  <td style={{ color: 'var(--txt-3)', fontSize: '.8rem' }}>{formatDate(c.createdAt)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={e => handleDelete(e, c._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
