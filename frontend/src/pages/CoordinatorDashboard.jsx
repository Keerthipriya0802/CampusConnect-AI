import { useEffect, useState } from 'react';
import { Briefcase, Users, CheckCircle2, ClipboardList, FileText, CircleDollarSign } from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

export default function CoordinatorDashboard({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activePlacementDrives: 0,
    totalApplications: 0,
    studentsPlaced: 0,
    studentsNotPlaced: 0,
    offerLettersReceived: 0,
    offerLettersPending: 0,
    placementRate: 0,
  });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/coordinator/dashboard-stats'),
      api.get('/applications/coordinator'),
    ])
      .then(([statsRes, appRes]) => {
        setStats(statsRes.data || {});
        setApplications(appRes.data || []);
      })
      .catch(() => {
        setStats({
          totalStudents: 0,
          activePlacementDrives: 0,
          totalApplications: 0,
          studentsPlaced: 0,
          studentsNotPlaced: 0,
          offerLettersReceived: 0,
          offerLettersPending: 0,
          placementRate: 0,
        });
        setApplications([]);
      });
  }, []);

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, { status });
      setApplications((current) => current.map((application) => application._id === applicationId ? response.data : application));
      const statsRes = await api.get('/coordinator/dashboard-stats');
      setStats(statsRes.data || {});
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update application status');
    }
  };

  return (
    <div className="dashboard-page coordinator-dashboard space-y-6">
      <div className="dashboard-hero rounded-3xl p-6 text-white shadow-xl">
        <span className="dashboard-eyebrow">Coordinator workspace</span>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name || 'Placement Coordinator'}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users />} title="Total Students" value={stats.totalStudents || 0} />
        <StatCard icon={<Briefcase />} title="Active Placement Drives" value={stats.activePlacementDrives || 0} />
        <StatCard icon={<ClipboardList />} title="Total Applications" value={stats.totalApplications || 0} />
        <StatCard icon={<CheckCircle2 />} title="Students Placed" value={stats.studentsPlaced || 0} />
        <StatCard icon={<Users />} title="Students Not Placed" value={stats.studentsNotPlaced || 0} />
        <StatCard icon={<FileText />} title="Offer Letters Received" value={stats.offerLettersReceived || 0} />
        <StatCard icon={<FileText />} title="Offer Letters Pending" value={stats.offerLettersPending || 0} />
        <StatCard icon={<CircleDollarSign />} title="Placement Rate" value={`${stats.placementRate || 0}%`} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Placement Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBox label="Total Students" value={stats.totalStudents || 0} />
          <InfoBox label="Placed Students" value={stats.studentsPlaced || 0} />
          <InfoBox label="Not Placed Students" value={stats.studentsNotPlaced || 0} />
          <InfoBox label="Placement Percentage" value={`${stats.placementRate || 0}%`} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction href="/student-management" label="+ Add Student" />
          <QuickAction href="/student-management" label="Import Students" />
          <QuickAction href="/drives" label="+ Create Placement Drive" />
          <QuickAction href="/applications" label="View Applications" />
          <QuickAction href="/placement-tracking" label="Placement Tracking" />
          <QuickAction href="/offer-letters" label="Offer Letter Management" />
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Placement Applications</h2><p className="mt-1 text-sm text-slate-500">Review submitted applications and update their status.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{applications.length} received</span></div>
        {applications.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Drive</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Roll No</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">CGPA</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{applications.map((application) => { const data = application.snapshot || {}; return <tr key={application._id}><td className="px-4 py-3 font-medium">{application.drive?.company || '—'}<br /><span className="text-xs font-normal text-slate-500">{application.drive?.role || application.drive?.title || 'Role'}</span></td><td className="px-4 py-3">{data.name}</td><td className="px-4 py-3">{data.rollNo}</td><td className="px-4 py-3">{data.department}</td><td className="px-4 py-3">{data.cgpa}</td><td className="px-4 py-3"><select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={application.status} onChange={(event) => updateApplicationStatus(application._id, event.target.value)}><option>Applied</option><option>Shortlisted</option><option>Rejected</option><option>Interview Scheduled</option><option>Selected</option></select></td></tr>; })}</tbody></table></div> : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No applications received yet.</p>}
      </section>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-blue-600">{icon}<span className="text-sm">{title}</span></div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickAction({ href, label }) {
  return <a href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">{label}</a>;
}
