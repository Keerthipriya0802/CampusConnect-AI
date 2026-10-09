import { useEffect, useState } from 'react';
import api from '../services/api';
import { Bot, CheckCircle2, SendHorizonal, Users } from 'lucide-react';

export default function AIChatPage({ user }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I can help with eligibility, applications, interviews, and next steps.' }]);
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationError, setRecommendationError] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [drives, setDrives] = useState([]);
  const [eligibilityDriveId, setEligibilityDriveId] = useState('');
  const [eligibleStudents, setEligibleStudents] = useState(null);
  const [eligibilityError, setEligibilityError] = useState('');
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const isCoordinator = user?.role === 'coordinator' || user?.role === 'admin';

  useEffect(() => {
    if (!isCoordinator) return;
    api.get('/drives')
      .then((response) => setDrives(response.data || []))
      .catch((error) => setEligibilityError(error.response?.data?.message || 'Could not load placement drives.'));
  }, [isCoordinator]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await api.post('/ai/chat', { message: input });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: error.response?.data?.message || 'The AI assistant is temporarily unavailable.' }]);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    setRecommendationError('');
    try {
      const response = await api.get('/ai/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      setRecommendationError(error.response?.data?.message || 'Could not load placement recommendations.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const analyzeCompanyEligibility = async () => {
    if (!eligibilityDriveId) return;
    setLoadingEligibility(true);
    setEligibilityError('');
    setEligibleStudents(null);
    try {
      const response = await api.get(`/drives/${eligibilityDriveId}/eligible-students`);
      setEligibleStudents(response.data || []);
    } catch (error) {
      setEligibilityError(error.response?.data?.message || 'Could not analyze company eligibility.');
    } finally {
      setLoadingEligibility(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Bot className="text-blue-600" />
        <h1 className="text-2xl font-semibold">AI Placement Assistant</h1>
      </div>
      <p className="mt-2 text-sm text-slate-600">Ask anything about placements, eligibility, and your next steps.</p>
      {user?.role === 'student' ? <section className="mt-5 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Personalized opportunities</h2>
            <p className="mt-1 text-sm text-slate-600">Only drives that pass your recorded mandatory eligibility criteria are included.</p>
          </div>
          <button onClick={loadRecommendations} disabled={loadingRecommendations} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {loadingRecommendations ? 'Analyzing...' : 'Get recommendations'}
          </button>
        </div>
        {recommendationError ? <p role="alert" className="mt-3 text-sm text-red-700">{recommendationError}</p> : null}
        {recommendations ? (
          <div className="mt-4 space-y-3">
            <p className="whitespace-pre-line text-sm text-slate-700">{recommendations.analysis}</p>
            {recommendations.recommendations.map((drive) => (
              <article key={drive.driveId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{drive.company}</h3>
                    <p className="text-sm text-slate-600">{drive.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-semibold text-emerald-700">Eligible</span>
                    <span className="text-sm font-medium text-slate-700">
                      {drive.matchScore === null ? 'Skill fit unavailable' : `${drive.matchScore}% AI skill fit`}
                    </span>
                  </div>
                </div>
                {drive.matchScore !== null ? (
                  <>
                    <p className="mt-2 text-xs text-slate-500">Matched skills: {drive.matchedSkills.length ? drive.matchedSkills.join(', ') : 'No direct matches identified'}</p>
                    {drive.skillGaps.length ? <p className="mt-1 text-xs text-slate-500">Suggested skills to develop: {drive.skillGaps.join(', ')}</p> : null}
                  </>
                ) : null}
              </article>
            ))}
            {!recommendations.recommendations.length ? recommendations.ineligibleDrives?.map((drive) => (
              <article key={`${drive.company}-${drive.role}`} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-slate-900">{drive.company} · {drive.role}</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                  {drive.failedCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
                </ul>
              </article>
            )) : null}
          </div>
        ) : null}
      </section> : null}
      {isCoordinator ? (
        <section className="mt-5 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={19} />
            <h2 className="font-semibold">Company eligibility analysis</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">Review students who pass the company’s mandatory criteria and see each verified check.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              aria-label="Select placement company"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={eligibilityDriveId}
              onChange={(event) => {
                setEligibilityDriveId(event.target.value);
                setEligibleStudents(null);
              }}
            >
              <option value="">Select a placement company</option>
              {drives.map((drive) => <option key={drive._id} value={drive._id}>{drive.company} · {drive.role || drive.title}</option>)}
            </select>
            <button
              onClick={analyzeCompanyEligibility}
              disabled={!eligibilityDriveId || loadingEligibility}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loadingEligibility ? 'Checking...' : 'Show eligible students'}
            </button>
          </div>
          {eligibilityError ? <p role="alert" className="mt-3 text-sm text-red-700">{eligibilityError}</p> : null}
          {eligibleStudents ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-slate-800">{eligibleStudents.length} eligible student{eligibleStudents.length === 1 ? '' : 's'}</p>
              {eligibleStudents.length ? eligibleStudents.map((student) => (
                <article key={student.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-600">{student.registerNumber || student.email} · {student.department}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Eligible</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {student.criteria.map((criterion) => (
                      <div key={criterion.name} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                        <span className="font-semibold">{criterion.name}: </span>
                        {criterion.studentValue} · Requirement: {criterion.requirement}
                      </div>
                    ))}
                  </div>
                </article>
              )) : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No student currently meets every recorded requirement for this drive.</p>}
            </div>
          ) : null}
        </section>
      ) : null}
      <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
        {messages.map((message, index) => (
          <div key={index} className={`rounded-2xl p-3 ${message.role === 'assistant' ? 'bg-white text-slate-700' : 'bg-blue-600 text-white'}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="Ask the AI assistant..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage} className="rounded-xl bg-blue-600 p-2 text-white"><SendHorizonal size={18} /></button>
      </div>
    </div>
  );
}
