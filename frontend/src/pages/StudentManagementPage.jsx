import { useEffect, useState } from 'react';
import { Edit3, FileSpreadsheet, Plus, RotateCcw, Trash2, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Dashboard.css';

const emptyStudent = { name: '', rollNo: '', gender: '', department: '', email: '', phone: '', cgpa: '', arrears: '', password: '' };
const genderOptions = ['Female', 'Male'];
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

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const res = await api.get('/coordinator/students');
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveStudent = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, cgpa: Number(form.cgpa), arrears: Number(form.arrears) };
      if (editingId) {
        delete payload.password;
        await api.put(`/coordinator/students/${editingId}`, payload);
        toast.success('Student updated');
      } else {
        await api.post('/coordinator/students', payload);
        toast.success('Student added');
      }
      setForm(emptyStudent);
      setEditingId(null);
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save student');
    }
  };

  const editStudent = (student) => setForm({ ...student, password: '' }) || setEditingId(student.id);

  const deleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
    try {
      await api.delete(`/coordinator/students/${student.id}`);
      toast.success('Student deleted');
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete student');
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/coordinator/students/${resetId}/reset-password`, { password: resetPassword });
      toast.success('Password reset successfully');
      setResetId(null);
      setResetPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password');
    }
  };

  const importStudents = async () => {
    if (!importFile) return;
    const data = new FormData();
    data.append('file', importFile);
    try {
      const res = await api.post('/coordinator/students/import', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Successfully imported: ${res.data.imported}. Failed: ${res.data.failed}.`);
      if (res.data.failures?.length) console.warn('Import failures', res.data.failures);
      setImportFile(null);
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to import students');
    }
  };

  const renderField = (field) => {
    if (field === 'gender' || field === 'department') {
      const options = field === 'gender' ? genderOptions : departmentOptions;
      return <select key={field} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" name={field} value={form[field] || ''} onChange={updateField} required><option value="">Select {field === 'gender' ? 'Gender' : 'Department'}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    }
    return <input key={field} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" name={field} placeholder={field === 'rollNo' ? 'Roll No' : field === 'cgpa' ? 'CGPA' : field === 'arrears' ? 'Number of Arrears' : field[0].toUpperCase() + field.slice(1)} type={field === 'cgpa' ? 'number' : 'text'} step={field === 'cgpa' ? '0.01' : undefined} min={field === 'cgpa' || field === 'arrears' ? '0' : undefined} max={field === 'cgpa' ? '10' : undefined} value={form[field] || ''} onChange={updateField} required />;
  };

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-hero rounded-3xl p-6 text-white shadow-xl">
        <span className="dashboard-eyebrow">Coordinator workspace</span>
        <h1 className="text-2xl font-semibold">Student Management</h1>
        <p className="mt-2">Create and maintain student accounts securely from one place.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-lg font-semibold"><Users size={19} /> {total} students</h2><p className="mt-1 text-sm text-slate-500">Student credentials are never shown here.</p></div>
          <div className="flex flex-wrap gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium"><FileSpreadsheet size={16} /> Import Students<input className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={(event) => setImportFile(event.target.files?.[0] || null)} /></label>
            {importFile ? <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white" onClick={importStudents}>Upload {importFile.name}</button> : null}
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white" onClick={() => { setEditingId(null); setForm(emptyStudent); }}><Plus size={16} /> Add Student</button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={saveStudent}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{editingId ? 'Edit Student' : 'Add Student'}</h2>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(emptyStudent); }}><X size={18} /></button> : null}</div>
          <div className="grid gap-3 md:grid-cols-3">
            {['name', 'rollNo', 'gender', 'department', 'email', 'phone', 'cgpa', 'arrears'].map(renderField)}
            {!editingId ? <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" name="password" placeholder="Initial Password" type="password" value={form.password} onChange={updateField} required /> : null}
          </div>
          <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white" type="submit">{editingId ? 'Save Changes' : 'Add Student'}</button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Roll No</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">CGPA</th><th className="px-5 py-4">Arrears</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td className="px-5 py-6" colSpan="7">Loading students...</td></tr> : students.map((student) => <tr key={student.id}><td className="px-5 py-4 font-medium text-slate-900">{student.name}</td><td className="px-5 py-4">{student.rollNo}</td><td className="px-5 py-4">{student.department}</td><td className="px-5 py-4">{student.email}</td><td className="px-5 py-4">{student.cgpa}</td><td className="px-5 py-4">{student.arrears}</td><td className="px-5 py-4"><div className="flex gap-2"><button title="Edit" onClick={() => editStudent(student)}><Edit3 size={16} /></button><button title="Reset password" onClick={() => setResetId(student.id)}><RotateCcw size={16} /></button><button title="Delete" onClick={() => deleteStudent(student)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
      </section>

      {resetId ? <div className="fixed inset-0 z-10 grid place-items-center bg-slate-950/40 p-4"><form className="w-full max-w-sm rounded-2xl bg-white p-6" onSubmit={submitReset}><h2 className="text-lg font-semibold">Reset student password</h2><input className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2" type="password" placeholder="New password" minLength="6" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} required /><div className="mt-4 flex justify-end gap-2"><button type="button" className="rounded-xl border px-3 py-2" onClick={() => setResetId(null)}>Cancel</button><button className="rounded-xl bg-blue-600 px-3 py-2 text-white" type="submit">Reset Password</button></div></form></div> : null}
    </div>
  );
}
