import { useEffect, useState } from 'react';
import { FileText, LockKeyhole, Plus, Trash2, Upload, UserCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Dashboard.css';

const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };
const departmentOptions = [
  'Information Technology (IT)',
  'Computer Science and Engineering (CSE)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Artificial Intelligence and Data Science (AI&DS)',
  'Artificial Intelligence and Machine Learning (AIML)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Information Science and Engineering (ISE)',
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [skill, setSkill] = useState('');
  const [password, setPassword] = useState(emptyPassword);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setProfile(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load profile');
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/students/profile', { name: profile.name, department: profile.department, phone: profile.phone, email: profile.email, cgpa: Number(profile.cgpa), arrears: Number(profile.arrears), tenthPercentage: Number(profile.tenthPercentage), twelfthPercentage: Number(profile.twelfthPercentage) });
      setProfile(res.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateSkills = async (skills) => {
    try {
      const res = await api.put('/students/profile/skills', { skills });
      setProfile({ ...profile, skills: res.data.skills });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update skills');
    }
  };

  const addSkill = (event) => {
    event.preventDefault();
    const value = skill.trim();
    if (!value || profile.skills.includes(value)) return;
    updateSkills([...profile.skills, value]);
    setSkill('');
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('resume', file);
    try {
      const res = await api.post('/students/profile/resume', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile({ ...profile, resume: res.data.resume });
      toast.success('Resume uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload resume');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    try {
      await api.put('/students/change-password', password);
      setPassword(emptyPassword);
      toast.success('Password changed successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password');
    }
  };

  if (!profile) return <div className="dashboard-page text-sm text-slate-500">Loading profile...</div>;

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-hero rounded-3xl p-6 text-white shadow-xl"><span className="dashboard-eyebrow">Student workspace</span><h1 className="text-2xl font-semibold">Student Profile</h1><p className="mt-2">Keep your placement profile current and ready to share.</p></div>
      <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={saveProfile}>
        <div className="flex items-center gap-2"><UserCircle2 size={19} className="text-blue-600" /><h2 className="text-lg font-semibold">Personal and academic information</h2></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
          <Field label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
          <SelectField label="Department" value={profile.department} options={departmentOptions} onChange={(value) => setProfile({ ...profile, department: value })} />
          <Field label="Phone Number" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
          <Field label="CGPA" type="number" value={profile.cgpa} onChange={(value) => setProfile({ ...profile, cgpa: value })} />
          <Field label="Number of Arrears" type="number" value={profile.arrears} onChange={(value) => setProfile({ ...profile, arrears: value })} />
          <Field label="10th Percentage" type="number" value={profile.tenthPercentage} onChange={(value) => setProfile({ ...profile, tenthPercentage: value })} />
          <Field label="12th Percentage" type="number" value={profile.twelfthPercentage} onChange={(value) => setProfile({ ...profile, twelfthPercentage: value })} />
        </div>
        <button className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><FileText size={19} className="text-blue-600" /><h2 className="text-lg font-semibold">Career information</h2></div><div className="mt-5 flex flex-wrap items-center gap-3">{profile.resume ? <a className="rounded-xl border border-slate-300 px-3 py-2 text-sm" href={`http://localhost:5000${profile.resume}`} target="_blank" rel="noreferrer">View Resume</a> : <span className="text-sm text-slate-500">No resume uploaded</span>}<label className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"><Upload size={15} /> {profile.resume ? 'Replace Resume' : 'Upload Resume'}<input className="hidden" type="file" accept="application/pdf" onChange={uploadResume} /></label><span className="text-xs text-slate-500">PDF, up to 5 MB</span></div><div className="mt-6"><p className="text-sm font-semibold text-slate-700">Skills</p><div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((item) => <span key={item} className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800">{item}<button type="button" title={`Remove ${item}`} onClick={() => updateSkills(profile.skills.filter((skillItem) => skillItem !== item))}><Trash2 size={13} /></button></span>)}</div><form className="mt-4 flex max-w-md gap-2" onSubmit={addSkill}><input className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Add a skill" value={skill} onChange={(event) => setSkill(event.target.value)} /><button className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white" type="submit"><Plus size={15} /> Add</button></form></div></section>
      <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={changePassword}><div className="flex items-center gap-2"><LockKeyhole size={19} className="text-blue-600" /><h2 className="text-lg font-semibold">Security</h2></div><div className="mt-5 grid gap-4 md:grid-cols-3"><Field label="Current Password" type="password" value={password.currentPassword} onChange={(value) => setPassword({ ...password, currentPassword: value })} /><Field label="New Password" type="password" value={password.newPassword} onChange={(value) => setPassword({ ...password, newPassword: value })} /><Field label="Confirm New Password" type="password" value={password.confirmPassword} onChange={(value) => setPassword({ ...password, confirmPassword: value })} /></div><button className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white" type="submit">Change Password</button></form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} required /></label>;
}

function SelectField({ label, value, options, onChange }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<select className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" value={value ?? ''} onChange={(event) => onChange(event.target.value)} required><option value="">Select {label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
