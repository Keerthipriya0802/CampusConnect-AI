import { useState } from 'react';
import { FileText, TrendingUp } from 'lucide-react';

const students = [
  { name: 'Asha Menon', company: 'Infosys', status: 'Offer Accepted', date: '2026-07-12', package: '6.2 LPA' },
  { name: 'Ravi Sharma', company: 'TCS', status: 'Interview Round 2', date: '2026-07-15', package: '3.8 LPA' },
  { name: 'Meera Iyer', company: 'Wipro', status: 'Offer Received', date: '2026-07-10', package: '5.5 LPA' },
];

export default function CoordinatorProfilePage() {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">Coordinator Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Monitor the full offer-letter and interview tracking journey for all students.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-blue-600"><TrendingUp size={18} /> Placement Summary</div>
          <p className="mt-2 text-sm text-slate-600">3 active students tracked</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-blue-600"><FileText size={18} /> Offers Pending</div>
          <p className="mt-2 text-sm text-slate-600">2 offer letters need follow-up</p>
        </div>
      </div>

      <div className="space-y-3">
        {students.map((student, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-600">{student.company} • {student.package}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{student.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Last update: {student.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
