import { useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function PlacementApplicationForm({ drive, onClose, onSubmitted }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/students/profile').then((res) => setProfile(res.data)).catch((error) => toast.error(error.response?.data?.message || 'Unable to load your profile')).finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!profile?.name || !profile?.rollNo || !profile?.gender || !profile?.department || !profile?.email || !profile?.phone || profile.tenthPercentage === undefined || profile.tenthPercentage === null || profile.tenthPercentage === '' || profile.twelfthPercentage === undefined || profile.twelfthPercentage === null || profile.twelfthPercentage === '' || profile.cgpa === undefined || profile.cgpa === null || profile.cgpa === '' || profile.arrears === undefined || profile.arrears === null || profile.arrears === '' || !profile?.skills?.length || !profile?.resume) {
      toast.error(profile?.resume ? 'Please complete your profile before applying.' : 'Please upload your resume before applying.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/applications', { driveId: drive._id });
      toast.success('Application submitted successfully.');
      onSubmitted(drive._id);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-blue-700">Placement Application</p><h2 className="mt-1 text-xl font-semibold text-slate-900">{drive.company} · {drive.role || drive.title}</h2><p className="mt-1 text-sm text-slate-500">Verify your saved profile details before submitting.</p></div><button type="button" onClick={onClose} className="text-slate-500"><X size={20} /></button></div>{loading ? <p className="mt-8 text-sm text-slate-500">Loading your profile...</p> : <form onSubmit={submit} className="mt-6 space-y-6"><ApplicationSection title="Personal Information"><div className="grid gap-3 md:grid-cols-2"><Readonly label="Name" value={profile.name} /><Readonly label="Roll No" value={profile.rollNo} /><Readonly label="Gender" value={profile.gender} /><Readonly label="Department" value={profile.department} /><Readonly label="Email" value={profile.email} /><Readonly label="Phone" value={profile.phone} /></div></ApplicationSection><ApplicationSection title="Academic Information"><div className="grid gap-3 md:grid-cols-2"><Readonly label="10th Percentage" value={profile.tenthPercentage ? `${profile.tenthPercentage}%` : ''} /><Readonly label="12th Percentage" value={profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : ''} /><Readonly label="CGPA" value={profile.cgpa} /><Readonly label="Number of Arrears" value={profile.arrears} /></div></ApplicationSection><ApplicationSection title="Skills"><div className="flex flex-wrap gap-2">{profile.skills?.length ? profile.skills.map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800">{skill}</span>) : <p className="text-sm text-slate-500">No skills saved. Add skills from your profile.</p>}</div></ApplicationSection><ApplicationSection title="Resume"><div className="flex flex-wrap items-center gap-3">{profile.resume ? <><FileText size={18} className="text-blue-600" /><span className="text-sm text-slate-700">Saved resume ready to submit</span><a className="text-sm font-medium text-blue-700" href={`http://localhost:5000${profile.resume}`} target="_blank" rel="noreferrer">View Resume</a></> : <p className="text-sm text-red-600">Please upload your resume from Student Profile before applying.</p>}</div></ApplicationSection><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={submitting || !profile.resume} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300">{submitting ? 'Submitting...' : 'Submit Application'}</button></div></form>}</div></div>;
}

function ApplicationSection({ title, children }) { return <section><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>{children}</section>; }
function Readonly({ label, value }) { return <label className="text-sm font-medium text-slate-700">{label}<input className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-normal text-slate-700" value={value ?? ''} readOnly placeholder={`Missing ${label.toLowerCase()}`} /></label>; }
