import { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Upload, Download, Eye } from 'lucide-react';

export default function OfferLettersPage({ user }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalReceived: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [file, setFile] = useState(null);

  const isCoordinator = user?.role === 'coordinator' || user?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    const request = isCoordinator ? api.get('/coordinator/offer-letters') : api.get('/students/my-placement');

    request
      .then((res) => {
        if (isCoordinator) {
          const data = res.data || {};
          setRows(data.rows || []);
          setSummary({ totalReceived: data.totalReceived || 0, totalPending: data.totalPending || 0 });
        } else {
          const placement = res.data || {};
          const current = placement.placement || { company: '', package: 0, offerLetterStatus: 'Pending', offerLetter: null };
          setRows(current.company ? [{ name: user.name, rollNo: user.rollNo || '-', department: user.department || '-', company: current.company, package: current.package, placementStatus: 'Placed', offerLetterStatus: current.offerLetterStatus || 'Pending', offerLetter: current.offerLetter || null }] : []);
          setSummary({ totalReceived: current.offerLetter ? 1 : 0, totalPending: current.offerLetter ? 0 : 1 });
        }
      })
      .catch(() => {
        setRows([]);
        setSummary({ totalReceived: 0, totalPending: 0 });
      })
      .finally(() => setLoading(false));
  }, [user, isCoordinator]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!studentId || !file) return alert('Select a placed student and a PDF offer letter');
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('file', file);

    try {
      await api.post('/coordinator/offer-letters', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Offer letter upload failed');
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Offer Letters</h1>
      <p className="mt-2 text-sm text-slate-600">Track offer letters across placement records and upload the official company documents.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Received</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.totalReceived}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.totalPending}</p>
        </div>
      </div>

      {isCoordinator && (
        <form onSubmit={handleUpload} className="mt-6 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Upload Offer Letter</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"><Upload size={16} /> Upload Offer Letter</button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Roll No</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Placement Status</th>
              <th className="px-4 py-3">Offer Letter Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : rows.length ? rows.map((row) => (
              <tr key={row.studentId || row.company}>
                <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                <td className="px-4 py-3">{row.rollNo}</td>
                <td className="px-4 py-3">{row.department}</td>
                <td className="px-4 py-3">{row.company}</td>
                <td className="px-4 py-3">₹{row.package || 0} LPA</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{row.placementStatus}</span></td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${row.offerLetterStatus === 'Received' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{row.offerLetterStatus}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {row.offerLetter ? (
                      <>
                        <a href={`http://localhost:5000${row.offerLetter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-700"><Eye size={12} /> View</a>
                        <a href={`http://localhost:5000${row.offerLetter}`} download className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-700"><Download size={12} /> Download</a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">No file</span>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">No offer letters found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
