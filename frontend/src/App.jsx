import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import RegisterComplaint  from './pages/RegisterComplaint';
import ComplaintList      from './pages/ComplaintList';
import ComplaintDetail    from './pages/ComplaintDetail';
import './index.css';

// ─── Protected Route wrapper ───────────────────────────────────────────────────
const Protected = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, authLogout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { authLogout(); navigate('/login'); };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/complaints" className="navbar-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">ComplaintAI</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/complaints" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            All Complaints
          </NavLink>
          <NavLink to="/complaints/new" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            + New
          </NavLink>
          <span className="nav-user">
            {user?.role === 'admin' && <span className="badge badge-critical" style={{ background: 'rgba(99,102,241,.2)', color: 'var(--secondary)', borderColor: 'var(--primary)', marginRight: 6 }}>👑 Admin</span>}
            👤 {user?.name}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/complaints" element={<Protected><ComplaintList /></Protected>} />
          <Route path="/complaints/new" element={<Protected><RegisterComplaint /></Protected>} />
          <Route path="/complaints/:id" element={<Protected><ComplaintDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/complaints" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
