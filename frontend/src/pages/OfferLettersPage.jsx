import { FileText } from 'lucide-react';

const offers = [
  { company: 'Infosys', role: 'Software Engineer', package: '6 LPA', status: 'Offer Accepted', date: '2026-07-12', nextStep: 'Join formalities' },
  { company: 'TCS', role: 'Developer', package: '3.5 LPA', status: 'Interview Round 2', date: '2026-07-15', nextStep: 'Pending HR feedback' },
  { company: 'Wipro', role: 'Associate Engineer', package: '5.2 LPA', status: 'Offer Received', date: '2026-07-09', nextStep: 'Review documents' },
];

export default function OfferLettersPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Offer Letter Tracking</h1>
      <p className="mt-2 text-sm text-slate-600">Track every offer letter and the current stage with dates.</p>
      <div className="mt-6 space-y-3">
        {offers.map((offer, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-2 text-blue-600"><FileText size={18} /></div>
                <div>
                  <p className="font-medium text-slate-900">{offer.company}</p>
                  <p className="text-sm text-slate-600">{offer.role} • {offer.package}</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{offer.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>Updated: {offer.date}</span>
              <span>Next step: {offer.nextStep}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
