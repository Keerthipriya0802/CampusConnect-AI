import { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, CalendarDays, FileText, Sparkles, MessageSquareQuote } from 'lucide-react';

export default function StudentDashboard({ user }) {
  const [drives, setDrives] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [experience, setExperience] = useState('');
  const [submittedExperience, setSubmittedExperience] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [sharedExperiences, setSharedExperiences] = useState([
    { drive: 'Infosys - SDE', note: 'Focus on DSA, React fundamentals, and communication.' },
    { drive: 'TCS NQT', note: 'Prepare for reasoning, coding basics, and verbal ability.' },
  ]);

  useEffect(() => {
    Promise.all([api.get('/drives'), api.get('/materials')])
      .then(([driveRes, materialRes]) => {
        setDrives(driveRes.data);
        setMaterials(materialRes.data);
      })
      .catch(() => {
        setDrives([]);
        setMaterials([]);
      });
  }, []);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    try {
      const res = await api.post('/ai/chat', { message: aiQuestion });
      setAiAnswer(res.data.reply);
    } catch {
      setAiAnswer('The assistant is temporarily unavailable. Please try again shortly.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white shadow-xl">
        <h1 className="text-2xl font-semibold">Hello, {user?.name || 'Student'} 👋</h1>
        <p className="mt-2 text-blue-50">Track drives, interviews, and offers in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Briefcase />} title="Upcoming Drives" value={drives.length} />
        <StatCard icon={<CalendarDays />} title="Interviews" value="3" />
        <StatCard icon={<FileText />} title="Offer Letters" value="2" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Placement Drives</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">Live</span>
        </div>
        <div className="space-y-3">
          {drives.map((drive) => (
            <div key={drive._id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">{drive.title}</p>
                <p className="text-sm text-slate-600">{drive.company} • {drive.location}</p>
              </div>
              <a href={`/drives/${drive._id}`} className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white">View</a>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Share your interview experience</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">After each round, share what happened so coordinators can guide you better.</p>
        <textarea className="mt-4 w-full rounded-2xl border border-slate-300 px-3 py-2" rows="3" placeholder="Describe your latest round experience..." value={experience} onChange={(e) => setExperience(e.target.value)} />
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white" onClick={() => { setSubmittedExperience(experience); setExperience(''); }}>Submit Experience</button>
        {submittedExperience ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Latest update: {submittedExperience}</p> : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">AI Drive & Eligibility Assistant</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">Ask the AI about eligibility, drive requirements, and what to prepare next.</p>
        <input className="mt-4 w-full rounded-2xl border border-slate-300 px-3 py-2" placeholder="Ask: Am I eligible for Infosys SDE?" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} />
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white" onClick={handleAskAI}>Ask AI</button>
        {aiAnswer ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{aiAnswer}</p> : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Shared Interview Materials</h2>
        </div>
        <div className="mt-4 space-y-2">
          {materials.map((material) => (
            <div key={material._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">{material.title}</p>
                <p>{material.companyName} • {material.uploadedBy?.name || 'Coordinator'}</p>
              </div>
              <a href={`http://localhost:5000${material.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-3 py-2 text-white">Download</a>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Coordinator Shared Experience</h2>
        </div>
        <div className="mt-4 space-y-2">
          {sharedExperiences.map((entry, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{entry.drive}</p>
              <p>{entry.note}</p>
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
