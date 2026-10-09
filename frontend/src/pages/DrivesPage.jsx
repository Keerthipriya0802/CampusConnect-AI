import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarDays, Download, Edit3, Filter, MapPin, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import PlacementApplicationForm from '../components/PlacementApplicationForm';

const emptyForm = { title: '', company: '', role: '', package: '', eligibility: '', deadline: '', interviewDate: '', location: '', jobDescription: '', cgpaRequirement: '', tenthPercentageRequirement: '', twelfthPercentageRequirement: '', maxArrears: '0', allowedDepartments: '', status: 'open' };
const demoDrives = [
  { _id: null, company: 'TCS', role: 'Software Engineer', package: '7 LPA', eligibility: 'CSE, IT, ECE', cgpaRequirement: 7, deadline: '2026-09-08', interviewDate: '2026-09-15', location: 'On campus - Main Auditorium', status: 'open' },
  { _id: null, company: 'Infosys', role: 'Full Stack Developer', package: '6.5 LPA', eligibility: 'CSE, IT, ECE - CGPA 7.2+', cgpaRequirement: 7.2, deadline: '2026-09-14', interviewDate: '2026-09-21', location: 'Virtual', status: 'open' },
  { _id: null, company: 'Accenture', role: 'Application Developer', package: '7.8 LPA', eligibility: 'CSE, IT - CGPA 7.5+', cgpaRequirement: 7.5, deadline: '2026-09-20', interviewDate: '2026-09-28', location: 'Hybrid - Placement Cell', status: 'open' },
];

export default function DrivesPage({ user }) {
  const isStudent = user?.role === 'student';
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState(null);
  const [applicationDrive, setApplicationDrive] = useState(null);

  const loadDrives = () => api.get('/drives').then((res) => setDrives(res.data?.length ? res.data : demoDrives)).catch(() => setDrives(demoDrives));
  useEffect(() => { loadDrives(); }, []);
  const filteredDrives = useMemo(() => drives.filter((drive) => {
    const text = `${drive.company} ${drive.role || drive.title} ${drive.location || ''}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === 'all' || drive.status === statusFilter);
  }), [drives, search, statusFilter]);
  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const editDrive = (drive) => { setEditingId(drive._id); setForm({ ...emptyForm, ...drive, deadline: dateInput(drive.deadline), interviewDate: dateInput(drive.interviewDate), allowedDepartments: (drive.allowedDepartments || []).join(', ') }); setShowForm(true); };
  const submitDrive = async (event) => {
    event.preventDefault();
    const payload = { ...form, title: form.title || `${form.company} ${form.role}`, description: form.jobDescription || `${form.company} ${form.role} placement opportunity.`, cgpaRequirement: Number(form.cgpaRequirement) || 0, tenthPercentageRequirement: Number(form.tenthPercentageRequirement) || 0, twelfthPercentageRequirement: Number(form.twelfthPercentageRequirement) || 0, maxArrears: Number(form.maxArrears) || 0, allowedDepartments: form.allowedDepartments.split(',').map((item) => item.trim()).filter(Boolean) };
    try { if (editingId) await api.put(`/drives/${editingId}`, payload); else await api.post('/drives', payload); toast.success(editingId ? 'Drive updated' : 'Drive created'); setShowForm(false); setForm(emptyForm); loadDrives(); } catch (error) { toast.error(error.response?.data?.message || 'Could not save drive'); }
  };
  const deleteDrive = async (drive) => { if (!drive._id || !window.confirm(`Delete the ${drive.company} drive?`)) return; try { await api.delete(`/drives/${drive._id}`); toast.success('Drive deleted'); loadDrives(); } catch (error) { toast.error(error.response?.data?.message || 'Could not delete drive'); } };
  const apply = (drive) => { if (!drive._id) { toast.info('This drive is not connected to the database yet.'); return; } setApplicationDrive(drive); };
  const viewEligible = async (drive) => { setSelectedDrive(drive); setEligibleStudents([]); try { const response = await api.get(`/drives/${drive._id}/eligible-students`); setEligibleStudents(response.data); } catch (error) { toast.error(error.response?.data?.message || 'Could not load eligible students'); setEligibleStudents(null); } };
  const downloadEligible = async (drive) => { try { const response = await api.get(`/materials/export/${drive._id}`, { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = `${drive.company}-eligible-students.xlsx`; link.click(); URL.revokeObjectURL(url); } catch (error) { toast.error(error.response?.data?.message || 'Could not download students'); } };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div><p className="text-sm font-medium text-blue-700">Campus placements</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">Placement Drives</h1><p className="mt-2 text-sm text-slate-600">{isStudent ? 'Find the right opportunity and track every application.' : 'Create and manage opportunities for your student community.'}</p></div>
        {!isStudent && <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"><Plus size={17} /> Create Placement Drive</button>}
      </header>
      {!isStudent && showForm && <DriveForm form={form} editingId={editingId} onChange={updateForm} onSubmit={submitDrive} onCancel={() => setShowForm(false)} />}
      <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500"><Search size={17} /><input className="w-full border-0 py-2 outline-none" placeholder="Search company, role or location" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-600"><Filter size={16} /><select className="border-0 bg-transparent py-2 outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="closed">Closed</option><option value="completed">Completed</option></select></label></section>
      <div className="grid gap-5 xl:grid-cols-2">{filteredDrives.map((drive, index) => <DriveCard key={drive._id || `${drive.company}-${index}`} drive={drive} isStudent={isStudent} onApply={apply} onEdit={editDrive} onDelete={deleteDrive} onEligible={viewEligible} onDownload={downloadEligible} />)}</div>
      {!filteredDrives.length && <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Briefcase className="mx-auto text-slate-400" size={28} /><p className="mt-3 font-medium text-slate-800">No matching placement drives</p><p className="mt-1 text-sm text-slate-500">Try a different search or status filter.</p></div>}
      {selectedDrive && <EligibleModal drive={selectedDrive} students={eligibleStudents} onClose={() => setSelectedDrive(null)} />}
      {applicationDrive && <PlacementApplicationForm drive={applicationDrive} onClose={() => setApplicationDrive(null)} onSubmitted={(driveId) => setDrives((current) => current.map((item) => item._id === driveId ? { ...item, applicationStatus: 'Applied' } : item))} />}
    </div>
  );
}

function DriveCard({ drive, isStudent, onApply, onEdit, onDelete, onEligible, onDownload }) {
  const eligibility = drive.isEligible === undefined ? null : drive.isEligible;
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Briefcase size={20} /></div><div><h2 className="font-semibold text-slate-900">{drive.company}</h2><p className="text-sm text-blue-700">{drive.role || drive.title}</p></div></div><StatusBadge status={drive.status} /></div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><Info icon={<Briefcase size={15} />} label="Package" value={drive.package || drive.salaryPackage || 'As per company'} /><Info icon={<Users size={15} />} label="Eligibility" value={drive.eligibility || (drive.allowedDepartments || []).join(', ') || 'All departments'} /><Info icon={<CalendarDays size={15} />} label="Apply by" value={formatDate(drive.deadline)} /><Info icon={<MapPin size={15} />} label="Location / mode" value={drive.location || 'To be announced'} /></div>
      {drive.cgpaRequirement ? <p className="mt-4 text-xs text-slate-500">Minimum CGPA: <strong className="text-slate-700">{drive.cgpaRequirement}</strong> · Interview: {formatDate(drive.interviewDate)}</p> : null}
      {isStudent && <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium"><span className={`rounded-full px-2.5 py-1 ${eligibility ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{eligibility ? 'Eligible' : eligibility === false ? 'Not Eligible' : 'Profile required'}</span>{drive.applicationStatus ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">Application: {drive.applicationStatus}</span> : null}</div>}
      <div className="mt-5 flex flex-wrap gap-2">{isStudent ? <><Link to={drive._id ? `/drives/${drive._id}` : '/drives'} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">View Details</Link><button onClick={() => onApply(drive)} disabled={Boolean(drive.applicationStatus) || drive.status !== 'open'} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300">{drive.applicationStatus ? 'Applied' : 'Apply Now'}</button></> : <><button onClick={() => onEdit(drive)} disabled={!drive._id} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"><Edit3 size={15} /> Edit</button><button onClick={() => onDelete(drive)} disabled={!drive._id} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-40"><Trash2 size={15} /> Delete</button>{drive._id && <><button onClick={() => onEligible(drive)} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">View Eligible Students</button><button onClick={() => onDownload(drive)} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"><Download size={15} /> Excel</button></>}</>}</div>
      {!isStudent && <p className="mt-4 text-xs text-slate-500">{drive.applications?.length || 0} applicants</p>}
    </article>
  );
}

function DriveForm({ form, editingId, onChange, onSubmit, onCancel }) {
  return <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">{editingId ? 'Edit placement drive' : 'Create placement drive'}</h2><p className="mt-1 text-sm text-slate-600">Add the details students need to apply.</p></div><button type="button" onClick={onCancel} className="text-slate-500"><X size={20} /></button></div><div className="grid gap-3 md:grid-cols-2"><Field name="company" value={form.company} onChange={onChange} placeholder="Company name" required /><Field name="role" value={form.role} onChange={onChange} placeholder="Job role" required /><Field name="package" value={form.package} onChange={onChange} placeholder="Package (e.g. 7 LPA)" /><Field name="eligibility" value={form.eligibility} onChange={onChange} placeholder="Eligibility criteria" /><Field name="cgpaRequirement" value={form.cgpaRequirement} onChange={onChange} placeholder="Minimum CGPA" type="number" step="0.01" /><Field name="tenthPercentageRequirement" value={form.tenthPercentageRequirement} onChange={onChange} placeholder="Minimum 10th %" type="number" step="0.01" min="0" max="100" /><Field name="twelfthPercentageRequirement" value={form.twelfthPercentageRequirement} onChange={onChange} placeholder="Minimum 12th %" type="number" step="0.01" min="0" max="100" /><Field name="maxArrears" value={form.maxArrears} onChange={onChange} placeholder="Maximum arrears" type="number" min="0" /><Field name="allowedDepartments" value={form.allowedDepartments} onChange={onChange} placeholder="Departments, comma separated" /><Field name="deadline" value={form.deadline} onChange={onChange} type="date" required /><Field name="interviewDate" value={form.interviewDate} onChange={onChange} type="date" /><Field name="location" value={form.location} onChange={onChange} placeholder="Location / mode" /></div><textarea name="jobDescription" value={form.jobDescription} onChange={onChange} rows="3" placeholder="Job description" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" /><div className="flex gap-2"><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">{editingId ? 'Save Changes' : 'Create Drive'}</button><button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">Cancel</button></div></form>;
}

function Field({ name, value, onChange, placeholder, type = 'text', ...props }) { return <input name={name} value={value || ''} onChange={onChange} placeholder={placeholder} type={type} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" {...props} />; }
function Info({ icon, label, value }) { return <div className="min-w-0"><p className="flex items-center gap-1 text-xs text-slate-500">{icon}{label}</p><p className="mt-1 truncate font-medium text-slate-800">{value}</p></div>; }
function StatusBadge({ status }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${status === 'open' ? 'bg-emerald-50 text-emerald-700' : status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{status || 'open'}</span>; }
function EligibleModal({ drive, students, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">Eligible Students</h2><p className="mt-1 text-sm text-slate-500">{drive.company} · {drive.role || drive.title}</p></div><button onClick={onClose} className="text-slate-500"><X size={20} /></button></div>{students === null ? <p className="mt-6 text-sm text-slate-500">Unable to load eligible students.</p> : students.length ? <div className="mt-5 space-y-2">{students.map((student) => <div key={student.id} className="flex flex-wrap justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-sm"><span className="font-medium text-slate-900">{student.name} · {student.registerNumber}</span><span className="text-slate-600">{student.department} · CGPA {student.cgpa}</span></div>)}</div> : <p className="mt-6 text-sm text-slate-500">No eligible student profiles found.</p>}</div></div>; }
function dateInput(value) { return value ? new Date(value).toISOString().slice(0, 10) : ''; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'; }
