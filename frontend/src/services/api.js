import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────────
// In dev, Vite proxy forwards /api → localhost:5000
// In production (Render), VITE_API_URL must be set to the backend's live URL
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE });

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data);
export const login  = (data) => api.post('/auth/login', data);

// ─── Complaints ────────────────────────────────────────────────────────────────
export const createComplaint    = (data)          => api.post('/complaints', data);
export const getComplaints      = (params)        => api.get('/complaints', { params });
export const getComplaintById   = (id)            => api.get(`/complaints/${id}`);
export const updateComplaint    = (id, data)      => api.put(`/complaints/${id}`, data);
export const deleteComplaint    = (id)            => api.delete(`/complaints/${id}`);
export const searchByLocation   = (location)      => api.get('/complaints/search', { params: { location } });

// ─── AI ────────────────────────────────────────────────────────────────────────
export const analyzeComplaint   = (data)          => api.post('/ai/analyze', data);

export default api;
