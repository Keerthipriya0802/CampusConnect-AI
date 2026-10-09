import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Check, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import api from '../services/api';
import './LoginPage.css';

export default function LoginPage({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Login successful');
      navigate(res.data.user.role === 'student' ? '/student-dashboard' : '/coordinator-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const autofillDemo = () => {
    setForm({ email: 'demo.coordinator@campusconnect.ai', password: 'DemoCoordinator@123' });
  };

  return (
    <div className="login-page">
      <div className="login-showcase">
        <div className="login-brand"><span className="login-brand-mark"><Sparkles size={17} /></span><span>CampusConnect <strong>AI</strong></span></div>
        <div className="login-showcase-copy">
          <p className="login-kicker">Your next opportunity starts here</p>
          <h1>Make your<br /><em>next move</em> count.</h1>
          <p className="login-showcase-text">A smarter way for students and coordinators to connect, prepare, and move careers forward.</p>
        </div>
        <div className="login-proof"><span className="login-proof-icon"><Check size={15} /></span><span>One focused space for every placement milestone</span></div>
        <div className="login-showcase-shape login-showcase-shape-one" />
        <div className="login-showcase-shape login-showcase-shape-two" />
      </div>

      <main className="login-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><span className="login-brand-mark"><Sparkles size={16} /></span>CampusConnect <strong>AI</strong></div>
          <div className="login-heading">
            <span className="login-eyebrow">Member sign in</span>
            <h2>Welcome back<span>.</span></h2>
            <p>Sign in to pick up where you left off.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email">Email address</label>
            <div className="login-input-wrap"><Mail size={18} /><input id="login-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap"><LockKeyhole size={18} /><input id="login-password" type="password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <button className="login-submit" type="submit">Sign in <ArrowRight size={18} /></button>
          </form>
          <button className="login-demo-button" type="button" onClick={autofillDemo}>Coordinator</button>
          <p className="login-register">New student? <Link to="/register">Create an account</Link></p>
        </div>
        <p className="login-footer">(c) 2025 CampusConnect AI <span>|</span> Built for brighter careers</p>
      </main>
    </div>
  );
}
