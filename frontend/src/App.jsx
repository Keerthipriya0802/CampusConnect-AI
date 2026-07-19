import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LayoutDashboard, Briefcase, FileText, MessageSquareText, BarChart3, Settings, LogOut, UserCircle2, Sparkles } from 'lucide-react';
import api from './services/api';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import DrivesPage from './pages/DrivesPage';
import DriveDetailsPage from './pages/DriveDetailsPage';
import ProfilePage from './pages/ProfilePage';
import OfferLettersPage from './pages/OfferLettersPage';
import AIChatPage from './pages/AIChatPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import CoordinatorProfilePage from './pages/CoordinatorProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me').then((res) => {
      setUser(res.data);
    }).catch(() => {
      localStorage.removeItem('token');
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-700">Loading...</div>;

  const isStudent = user?.role === 'student';
  const isCoordinator = user?.role === 'coordinator' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {!user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' ? (
        <Navigate to="/" replace />
      ) : null}

      {user ? (
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="w-full lg:w-72 border-r border-slate-200 bg-slate-950 text-white p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-2xl bg-blue-600 p-2"><Sparkles size={20} /></div>
              <div>
                <h2 className="font-semibold">CampusConnect AI</h2>
                <p className="text-sm text-slate-400">Placement Portal</p>
              </div>
            </div>

            <nav className="space-y-2 text-sm">
              {isStudent ? (
                <>
                  <NavLink to="/student-dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                  <NavLink to="/drives" icon={<Briefcase size={18} />} label="Placement Drives" />
                  <NavLink to="/profile" icon={<UserCircle2 size={18} />} label="Profile" />
                  <NavLink to="/offer-letters" icon={<FileText size={18} />} label="Offer Letters" />
                  <NavLink to="/ai-chat" icon={<MessageSquareText size={18} />} label="AI Assistant" />
                  <NavLink to="/interview-prep" icon={<Sparkles size={18} />} label="Interview Prep" />
                </>
              ) : (
                <>
                  <NavLink to="/coordinator-dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                  <NavLink to="/drives" icon={<Briefcase size={18} />} label="Drives" />
                  <NavLink to="/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
                  <NavLink to="/offer-letters" icon={<FileText size={18} />} label="Offer Letters" />
                  <NavLink to="/coordinator-profile" icon={<UserCircle2 size={18} />} label="Coordinator Profile" />
                  <NavLink to="/ai-chat" icon={<MessageSquareText size={18} />} label="AI Assistant" />
                  <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
                </>
              )}
            </nav>

            <button onClick={logout} className="mt-8 flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
              <LogOut size={16} /> Logout
            </button>
          </aside>

          <main className="flex-1 p-6 lg:p-8">
            <Routes>
              <Route path="/student-dashboard" element={isStudent ? <StudentDashboard user={user} /> : <Navigate to="/coordinator-dashboard" replace />} />
              <Route path="/coordinator-dashboard" element={isCoordinator ? <CoordinatorDashboard user={user} /> : <Navigate to="/student-dashboard" replace />} />
              <Route path="/drives" element={<DrivesPage user={user} />} />
              <Route path="/drives/:id" element={<DriveDetailsPage user={user} />} />
              <Route path="/profile" element={isStudent ? <ProfilePage user={user} /> : <Navigate to="/coordinator-dashboard" replace />} />
              <Route path="/offer-letters" element={<OfferLettersPage user={user} />} />
              <Route path="/coordinator-profile" element={isCoordinator ? <CoordinatorProfilePage user={user} /> : <Navigate to="/student-dashboard" replace />} />
              <Route path="/ai-chat" element={<AIChatPage user={user} />} />
              <Route path="/interview-prep" element={isStudent ? <InterviewPrepPage user={user} /> : <Navigate to="/coordinator-dashboard" replace />} />
              <Route path="/analytics" element={isCoordinator ? <AnalyticsPage user={user} /> : <Navigate to="/student-dashboard" replace />} />
              <Route path="/settings" element={isCoordinator ? <SettingsPage user={user} /> : <Navigate to="/student-dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

function NavLink({ to, icon, label }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      {label}
    </Link>
  );
}

export default App;
