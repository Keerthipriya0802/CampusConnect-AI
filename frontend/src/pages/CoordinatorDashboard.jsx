import { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Users, CheckCircle2, CalendarDays, Sparkles, MessageSquareQuote, Upload, Download } from 'lucide-react';

export default function CoordinatorDashboard({ user }) {
  const [drives, setDrives] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [experience, setExperience] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [stats, setStats] = useState({ totalDrives: 0, registeredStudents: 0, selectedStudents: 0, upcomingInterviews: 0 });
  const [sharedExperiences, setSharedExperiences] = useState([
    { drive: 'Infosys - SDE', note: 'Technical round focused on DSA and React basics.' },
    { drive: 'TCS NQT', note: 'Candidates with strong CS fundamentals performed better.' },
  ]);

  useEffect(() => {
    Promise.all([api.get('/drives'), api.get('/materials')])
      .then(([driveRes, materialRes]) => {
        const driveData = driveRes.data || [];
        setDrives(driveData);
        setMaterials(materialRes.data || []);
        setStats({
          totalDrives: driveData.length,
          registeredStudents: driveData.reduce((sum, drive) => sum + (drive.applications?.length || 0), 0),
          selectedStudents: driveData.filter((drive) => drive.status === 'completed').length,
          upcomingInterviews: driveData.filter((drive) => drive.interviewDate).length,
        });
      })
      .catch(() => {
        setDrives([]);
        setMaterials([]);
        setStats({ totalDrives: 0, registeredStudents: 0, selectedStudents: 0, upcomingInterviews: 0 });
      });
  }, []);

  const handleAddExperience = () => {
    if (!selectedDrive || !experience.trim()) return;
    setSharedExperiences([{ drive: selectedDrive, note: experience }, ...sharedExperiences]);
    setExperience('');
  };

  const handleUploadMaterial = async () => {
    if (!selectedFile || !uploadTitle.trim() || !companyName.trim()) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle);
    formData.append('companyName', companyName);

    try {
      const res = await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials([res.data, ...materials]);
      setUploadTitle('');
      setCompanyName('');
      setSelectedFile(null);
    } catch {
      alert('Material upload failed.');
    }
  };

  const handleExportEligibleStudents = async () => {
    if (!selectedDrive) return;
    try {
      const res = await api.get(`/materials/export/${selectedDrive}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eligible-students.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Export failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-blue-700 p-6 text-white shadow-xl">
        <h1 className="text-2xl font-semibold">Coordinator Panel</h1>
        <p className="mt-2 text-slate-200">Welcome back, {user?.name || 'Coordinator'}. Manage drives and student progress efficiently.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<Briefcase />} title="Total Drives" value={stats.totalDrives} />
        <StatCard icon={<Users />} title="Registered Students" value={stats.registeredStudents} />
        <StatCard icon={<CheckCircle2 />} title="Selected Students" value={stats.selectedStudents} />
        <StatCard icon={<CalendarDays />} title="Upcoming Interviews" value={stats.upcomingInterviews} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Placement Drives</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">Managed</span>
        </div>
        <div className="space-y-3">
          {drives.map((drive) => (
            <div key={drive._id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">{drive.title}</p>
                <p className="text-sm text-slate-600">{drive.company} • {drive.status}</p>
              </div>
              <a href={`/drives/${drive._id}`} className="rounded-full bg-blue-600 px-3 py-2 text-sm text-white">Open</a>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Share previous interview experience</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">Add round-wise notes that will appear on the students’ dashboard as guidance.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select className="rounded-2xl border border-slate-300 px-3 py-2" value={selectedDrive} onChange={(e) => setSelectedDrive(e.target.value)}>
            <option value="">Select drive</option>
            {drives.map((drive) => <option key={drive._id} value={drive.title}>{drive.title}</option>)}
          </select>
          <textarea className="rounded-2xl border border-slate-300 px-3 py-2 md:col-span-2" rows="3" placeholder="Add interview experience or expectations" value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white" onClick={handleAddExperience}>Share Experience</button>
        <div className="mt-4 space-y-2">
          {sharedExperiences.map((entry, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{entry.drive}</p>
              <p>{entry.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">AI Eligibility Assistant</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">Ask the AI which students are most likely to be eligible for a drive based on CGPA, skills, and department.</p>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
          Example: “Show students eligible for Infosys SDE based on CGPA above 7.5 and React skills.”
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Upload size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Upload Interview Materials</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-300 px-3 py-2" placeholder="Material title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
          <input className="rounded-2xl border border-slate-300 px-3 py-2" placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <input className="rounded-2xl border border-slate-300 px-3 py-2 md:col-span-2" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        </div>
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white" onClick={handleUploadMaterial}>Upload Material</button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Download size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Export Eligible Students</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select className="rounded-2xl border border-slate-300 px-3 py-2" value={selectedDrive} onChange={(e) => setSelectedDrive(e.target.value)}>
            <option value="">Select drive</option>
            {drives.map((drive) => <option key={drive._id} value={drive._id}>{drive.title}</option>)}
          </select>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-white" onClick={handleExportEligibleStudents}>Export Excel</button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Shared Interview Materials</h2>
        </div>
        <div className="mt-4 space-y-2">
          {materials.map((material) => (
            <div key={material._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">{material.title}</p>
                <p>{material.companyName} • {material.uploadedBy?.name || 'Coordinator'}</p>
              </div>
              <a href={`http://localhost:5000${material.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-3 py-2 text-white">Open</a>
            </div>
          ))}
        </div>
      </div>
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
