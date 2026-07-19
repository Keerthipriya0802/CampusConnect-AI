import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase } from 'lucide-react';

export default function DrivesPage({ user }) {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', description: '', location: '', eligibility: '', package: '', deadline: '', status: 'open' });

  useEffect(() => {
    api.get('/drives').then((res) => setDrives(res.data)).catch(() => setDrives([]));
  }, []);

  const submitDrive = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drives', form);
      const res = await api.get('/drives');
      setDrives(res.data);
      setForm({ title: '', company: '', description: '', location: '', eligibility: '', package: '', deadline: '', status: 'open' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold">Placement Drives</h1>
        <p className="mt-2 text-sm text-slate-600">Create, manage, and review drives from a single place.</p>
      </div>

      {user?.role !== 'student' ? (
        <form onSubmit={submitDrive} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Create New Drive</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Drive Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Eligibility" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Package" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            <select className="rounded-xl border border-slate-300 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="rounded-full bg-blue-600 px-4 py-2 text-white" type="submit">Create Drive</button>
        </form>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {drives.length ? drives.map((drive) => (
            <div key={drive._id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-2 text-blue-600"><Briefcase size={18} /></div>
                <div>
                  <p className="font-medium text-slate-900">{drive.title}</p>
                  <p className="text-sm text-slate-600">{drive.company} • Deadline {new Date(drive.deadline).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Eligibility: {drive.eligibility || 'Any eligible student'} • Package: {drive.package || 'As per company'}</p>
                </div>
              </div>
              <Link to={`/drives/${drive._id}`} className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white">Open</Link>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              No drives yet. Coordinators can add new placement details from this page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
