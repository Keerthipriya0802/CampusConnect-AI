import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const FILTERS = ['All', 'Placed', 'Not Placed', 'Offer Letter Received', 'Offer Letter Pending'];

export default function PlacementTrackingPage() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/coordinator/placement-tracking')
      .then((res) => setStudents(res.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesFilter =
        filter === 'All'
          ? true
          : filter === 'Placed'
            ? student.placementStatus === 'Placed'
            : filter === 'Not Placed'
              ? student.placementStatus === 'Not Placed'
              : filter === 'Offer Letter Received'
                ? student.offerLetterStatus === 'Received'
                : student.offerLetterStatus !== 'Received';

      const matchesSearch = !normalizedSearch ||
        [student.name, student.rollNo, student.company].join(' ').toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [students, filter, search]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Placement Tracking</h1>
      <p className="mt-2 text-sm text-slate-600">Monitor the current placement status and offer-letter readiness of all students.</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`rounded-full px-3 py-2 text-sm ${filter === item ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-700'}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll no, or company"
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm lg:max-w-xs"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading placement data...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Placement Status</th>
                <th className="px-4 py-3">Offer Letter Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.length ? visibleStudents.map((student) => (
                <tr key={student._id} className="align-top">
                  <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                  <td className="px-4 py-3">{student.rollNo}</td>
                  <td className="px-4 py-3">{student.department || '-'}</td>
                  <td className="px-4 py-3">{student.company === '-' ? '—' : student.company}</td>
                  <td className="px-4 py-3">{student.package ? `₹${student.package} LPA` : '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${student.placementStatus === 'Placed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{student.placementStatus}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${student.offerLetterStatus === 'Received' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{student.offerLetterStatus === 'Received' ? 'Received' : 'Pending'}</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">No matching students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
