import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in to continue to CampusConnect AI.</p>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-semibold">Test login credentials</p>
          <p className="mt-1">Student: student123@gmail.com / student123</p>
          <p>Coordinator: coordinator123@gmail.com / coordinator123</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white" type="submit">Login</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">Don’t have an account? <Link to="/register" className="font-semibold text-blue-600">Create one</Link></p>
      </div>
    </div>
  );
}
