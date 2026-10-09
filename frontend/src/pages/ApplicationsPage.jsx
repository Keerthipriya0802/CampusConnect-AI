import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, FileText } from 'lucide-react';
import api from '../services/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my-applications').then((res) => setApplications(res.data)).catch(() => setApplications([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <p className="mt-2 text-sm text-slate-600">Track your submitted applications and the next step for each drive.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Loading applications...</p> : applications.length ? (
          <div className="space-y-3">{applications.map((application) => (
            <div key={application._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-2 text-blue-600"><Briefcase size={18} /></div><div><p className="font-medium text-slate-900">{application.drive?.company || 'Placement Drive'}</p><p className="text-sm text-slate-600">{application.drive?.role || application.drive?.title || 'Application'} · Applied {new Date(application.appliedAt).toLocaleDateString()}</p></div></div>
              <div className="flex items-center gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{application.status}</span>{application.drive?._id ? <Link to={`/drives/${application.drive._id}`} className="text-blue-700"><ChevronRight size={18} /></Link> : null}</div>
            </div>
          ))}</div>
        ) : <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center"><FileText className="mx-auto text-slate-400" size={24} /><p className="mt-2 font-medium text-slate-800">No applications yet</p><p className="mt-1 text-sm text-slate-500">Browse open placement drives to get started.</p><Link to="/drives" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse Drives</Link></div>}
      </div>
    </div>
  );
}
