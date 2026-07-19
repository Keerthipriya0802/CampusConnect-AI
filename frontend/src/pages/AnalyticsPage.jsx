import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Jan', drives: 6, selected: 4 },
  { name: 'Feb', drives: 8, selected: 6 },
  { name: 'Mar', drives: 10, selected: 8 },
  { name: 'Apr', drives: 7, selected: 5 },
];

export default function AnalyticsPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Visualize placement performance at a glance.</p>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="drives" fill="#2563eb" />
            <Bar dataKey="selected" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
