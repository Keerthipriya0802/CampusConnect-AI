import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import api from '../services/api';
import './LoginPage.css';

export default function RegisterPage({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register', form);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Student account created');
      navigate('/student-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-showcase">
        <div className="login-brand"><span className="login-brand-mark"><Sparkles size={17} /></span><span>CampusConnect <strong>AI</strong></span></div>
        <div className="login-showcase-copy">
          <p className="login-kicker">Your next opportunity starts here</p>
          <h1>Make your<br /><em>next move</em> count.</h1>
          <p className="login-showcase-text">Create your student account to track placement drives, applications, interviews, and offers.</p>
        </div>
        <div className="login-proof"><span className="login-proof-icon"><Sparkles size={15} /></span><span>Your placement journey, all in one focused space</span></div>
        <div className="login-showcase-shape login-showcase-shape-one" />
        <div className="login-showcase-shape login-showcase-shape-two" />
      </div>

      <main className="login-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><span className="login-brand-mark"><Sparkles size={16} /></span>CampusConnect <strong>AI</strong></div>
          <div className="login-heading">
            <span className="login-eyebrow">Student registration</span>
            <h2>Create account<span>.</span></h2>
            <p>Use your name and email to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="register-name">Full name</label>
            <div className="login-input-wrap"><UserRound size={18} /><input id="register-name" type="text" placeholder="Your name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={100} /></div>
            <label htmlFor="register-email">Email address</label>
            <div className="login-input-wrap"><Mail size={18} /><input id="register-email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
            <label htmlFor="register-password">Create password</label>
            <div className="login-input-wrap"><LockKeyhole size={18} /><input id="register-password" type="password" placeholder="At least 6 characters" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} /></div>
            <button className="login-submit" type="submit">Create student account <ArrowRight size={18} /></button>
          </form>
          <p className="login-register">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
        <p className="login-footer">(c) 2025 CampusConnect AI <span>|</span> Built for brighter careers</p>
      </main>
    </div>
  );
}