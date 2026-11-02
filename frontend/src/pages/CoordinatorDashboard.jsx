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
    wiproEligibleCount: 0,
    driveEligibilitySummary: [],
  });
  const [applications, setApplications] = useState([]);
  const [sharedExperiences, setSharedExperiences] = useState([]);
  const [companyDetails, setCompanyDetails] = useState([]);
  const [experienceForm, setExperienceForm] = useState({ company: '', role: '', note: '' });
  const [companyForm, setCompanyForm] = useState({ company: '', role: '', package: '', description: '', eligibility: '' });

  useEffect(() => {
    Promise.all([
      api.get('/coordinator/dashboard-stats'),
      api.get('/applications/coordinator'),
      api.get('/shared/interview-experiences'),
      api.get('/shared/company-details'),
    ])
      .then(([statsRes, appRes, experienceRes, companyRes]) => {
        setStats(statsRes.data || {});
        setApplications(appRes.data || []);
        setSharedExperiences(experienceRes.data || []);
        setCompanyDetails(companyRes.data || []);
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
          wiproEligibleCount: 0,
          driveEligibilitySummary: [],
        });
        setApplications([]);
        setSharedExperiences([]);
        setCompanyDetails([]);
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

  const handleSubmitExperience = async () => {
    if (!experienceForm.company.trim() || !experienceForm.note.trim()) return;
    try {
      const response = await api.post('/shared/interview-experiences', experienceForm);
      setSharedExperiences((current) => [response.data, ...current]);
      setExperienceForm({ company: '', role: '', note: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to share interview experience.');
    }
  };

  const handleSubmitCompany = async () => {
    if (!companyForm.company.trim()) return;
    try {
      const response = await api.post('/shared/company-details', companyForm);
      setCompanyDetails((current) => [response.data, ...current]);
      setCompanyForm({ company: '', role: '', package: '', description: '', eligibility: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to add company details.');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await api.delete(`/shared/company-details/${companyId}`);
      setCompanyDetails((current) => current.filter((company) => company._id !== companyId));
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete company detail.');
    }
  };

  const handleEditCompany = async (companyId) => {
    const company = companyDetails.find((item) => item._id === companyId);
    if (!company) return;

    const newCompany = window.prompt('Company name', company.company);
    if (newCompany === null) return;

    const newRole = window.prompt('Role', company.role || '');
    if (newRole === null) return;

    const newPackage = window.prompt('Package', company.package || '');
    if (newPackage === null) return;

    const newEligibility = window.prompt('Eligibility', company.eligibility || '');
    if (newEligibility === null) return;

    const newDescription = window.prompt('Description', company.description || '');
    if (newDescription === null) return;

    try {
      const response = await api.put(`/shared/company-details/${companyId}`, {
        company: newCompany.trim(),
        role: newRole.trim(),
        package: newPackage.trim(),
        eligibility: newEligibility.trim(),
        description: newDescription.trim(),
      });

      setCompanyDetails((current) => current.map((item) => item._id === companyId ? response.data : item));
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update company detail.');
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
        <StatCard icon={<CheckCircle2 />} title="Wipro Eligible" value={stats.wiproEligibleCount || 0} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Drive Eligibility Summary</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stats.driveEligibilitySummary?.length ? stats.driveEligibilitySummary.map((drive) => (
            <div key={drive._id || drive.company} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{drive.company}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{drive.eligibleCount}</p>
              <p className="text-xs text-slate-500">eligible students</p>
            </div>
          )) : <p className="text-sm text-slate-500">No active drives available.</p>}
        </div>
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Interview Experience Feed</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Add interview experience</p>
            <div className="mt-3 grid gap-3">
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Company name" value={experienceForm.company} onChange={(e) => setExperienceForm((current) => ({ ...current, company: e.target.value }))} />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Role / round" value={experienceForm.role} onChange={(e) => setExperienceForm((current) => ({ ...current, role: e.target.value }))} />
              <textarea rows="3" className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Share the interview experience..." value={experienceForm.note} onChange={(e) => setExperienceForm((current) => ({ ...current, note: e.target.value }))} />
              <button onClick={handleSubmitExperience} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">Publish Experience</button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Shared by students</p>
            <div className="mt-3 space-y-3">
              {sharedExperiences.length ? sharedExperiences.map((entry) => (
                <div key={entry._id || `${entry.company}-${entry.createdAt}`} className="rounded-xl bg-white p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{entry.company}{entry.role ? ` • ${entry.role}` : ''}</p>
                  <p className="text-xs text-slate-500">{entry.studentName || entry.sharedBy?.name || 'Student'} • {new Date(entry.createdAt).toLocaleDateString('en-IN')}</p>
                  <p className="mt-2">{entry.note}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No interview experiences shared yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Company Details</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Add a company</p>
            <div className="mt-3 grid gap-3">
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Company name" value={companyForm.company} onChange={(e) => setCompanyForm((current) => ({ ...current, company: e.target.value }))} />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Role" value={companyForm.role} onChange={(e) => setCompanyForm((current) => ({ ...current, role: e.target.value }))} />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Package" value={companyForm.package} onChange={(e) => setCompanyForm((current) => ({ ...current, package: e.target.value }))} />
              <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Eligibility" value={companyForm.eligibility} onChange={(e) => setCompanyForm((current) => ({ ...current, eligibility: e.target.value }))} />
              <textarea rows="3" className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Add company brief and preparation notes" value={companyForm.description} onChange={(e) => setCompanyForm((current) => ({ ...current, description: e.target.value }))} />
              <button onClick={handleSubmitCompany} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save Company Details</button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">Latest company details</p>
            <div className="mt-3 space-y-3">
              {companyDetails.length ? companyDetails.map((company) => (
                <div key={company._id} className="rounded-xl bg-white p-3 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{company.company}{company.role ? ` • ${company.role}` : ''}</p>
                      <p>{company.package ? `Package: ${company.package}` : 'Package not specified'}</p>
                      <p>{company.eligibility || 'Eligibility details not added yet.'}</p>
                      <p className="mt-1 text-slate-600">{company.description || 'No company summary added yet.'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCompany(company._id)} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Edit</button>
                      <button onClick={() => handleDeleteCompany(company._id)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No company details available.</p>}
            </div>
          </div>
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
