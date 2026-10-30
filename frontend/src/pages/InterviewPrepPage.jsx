import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Bot, BriefcaseBusiness, CheckCircle2, ChevronRight, Clock3, MessageSquareText, Play, Sparkles, Star, TrendingUp } from 'lucide-react';

const defaultSetup = {
  interviewType: 'Technical',
  domain: 'Java',
  difficulty: 'Beginner',
  totalQuestions: 5,
  experienceLevel: 'Fresher',
};

export default function InterviewPrepPage() {
  const [setup, setSetup] = useState(defaultSetup);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your technical mentor. Ask a Java, Python, SQL, DBMS, or HR question and I will explain it clearly.' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await api.get('/ai/mock/history');
        setHistory(response.data.interviews || []);
      } catch (error) {
        console.error('Could not load interview history', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const canSubmit = Boolean(session && currentQuestion && answer.trim());

  const questionCountOptions = useMemo(() => [5, 10, 15], []);

  const updateSetup = (field, value) => setSetup((previous) => ({ ...previous, [field]: value }));

  const sendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', content: trimmed };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await api.post('/ai/doubt', { message: trimmed, knowledgeLevel: 'Beginner' });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: error.response?.data?.message || 'The mentor is temporarily unavailable.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startInterview = async () => {
    setLoadingInterview(true);
    setEvaluation(null);
    setReport(null);
    try {
      const response = await api.post('/ai/mock/start', setup);
      const nextQuestion = response.data.question;
      setSession({ sessionId: response.data.sessionId, totalQuestions: response.data.totalQuestions, progress: response.data.progress });
      setCurrentQuestion(nextQuestion);
      setAnswer('');
    } catch (error) {
      setEvaluation({ feedback: error.response?.data?.message || 'Unable to start the mock interview right now.' });
    } finally {
      setLoadingInterview(false);
    }
  };

  const submitAnswer = async () => {
    if (!canSubmit || !session?.sessionId) return;
    setLoadingInterview(true);

    try {
      const response = await api.post('/ai/mock/answer', { sessionId: session.sessionId, answer });
      if (response.data.status === 'completed') {
        setReport(response.data.report);
        setSession(null);
        setCurrentQuestion(null);
        setAnswer('');
        const refreshed = await api.get('/ai/mock/history');
        setHistory(refreshed.data.interviews || []);
        return;
      }

      setEvaluation(response.data.evaluation || null);
      setCurrentQuestion(response.data.nextQuestion || null);
      setSession((prev) => ({ ...prev, progress: response.data.progress || prev.progress, currentIndex: response.data.currentIndex }));
      setAnswer('');
    } catch (error) {
      setEvaluation({ feedback: error.response?.data?.message || 'Unable to submit your answer.' });
    } finally {
      setLoadingInterview(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-2 text-blue-700"><Bot size={20} /></div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">AI Interview Preparation</h1>
            <p className="text-sm text-slate-600">Practice, get feedback, and sharpen your placement readiness.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText className="text-blue-600" size={18} />
              <h2 className="font-semibold text-slate-800">AI Doubt Assistant</h2>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {chatMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-2xl px-3 py-2 text-sm ${message.role === 'assistant' ? 'bg-white text-slate-700 border border-slate-200' : 'bg-blue-600 text-white ml-8'}`}>
                  {message.content}
                </div>
              ))}
              {chatLoading ? <div className="text-sm text-slate-500">Thinking...</div> : null}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask any technical or HR question..." className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" onKeyDown={(event) => { if (event.key === 'Enter') sendChat(); }} />
              <button onClick={sendChat} disabled={chatLoading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">Ask</button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-violet-600" size={18} />
              <h2 className="font-semibold text-slate-800">Mock Interview Setup</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-600">Interview Type
                <select value={setup.interviewType} onChange={(event) => updateSetup('interviewType', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <option>Technical</option>
                  <option>HR</option>
                  <option>Mixed</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">Domain
                <select value={setup.domain} onChange={(event) => updateSetup('domain', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <option>Java</option>
                  <option>Python</option>
                  <option>SQL</option>
                  <option>MERN Stack</option>
                  <option>General</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">Difficulty
                <select value={setup.difficulty} onChange={(event) => updateSetup('difficulty', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">Question Count
                <select value={setup.totalQuestions} onChange={(event) => updateSetup('totalQuestions', Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  {questionCountOptions.map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Experience Level: <span className="font-semibold text-slate-800">Fresher</span>
            </div>
            <button onClick={startInterview} disabled={loadingInterview} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              <Play size={16} /> {loadingInterview ? 'Preparing...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="text-emerald-600" size={18} />
          <h2 className="text-xl font-semibold text-slate-900">Mock Interview Session</h2>
        </div>

        {currentQuestion ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
              <span className="font-medium">Question {session?.progress || 1}</span>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">{currentQuestion.topic || setup.domain}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800">{currentQuestion.question}</div>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={6} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500" placeholder="Type or speak your answer here..." />
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={submitAnswer} disabled={!canSubmit || loadingInterview} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                <CheckCircle2 size={16} /> {loadingInterview ? 'Submitting...' : 'Submit Answer'}
              </button>
              <button onClick={() => setAnswer('')} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">Clear</button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Start a mock interview to receive the first AI question and structured evaluation.
          </div>
        )}

        {evaluation ? (() => {
          const summary = evaluation && typeof evaluation === 'object' && evaluation.scores
            ? evaluation
            : {
                scores: {
                  technicalCorrectness: 0,
                  clarity: 0,
                  relevance: 0,
                  communication: 0,
                  problemSolving: 0,
                },
                feedback: typeof evaluation === 'string' ? evaluation : 'Your answer was received. The evaluator is preparing a more detailed review.',
                followUpQuestion: 'Can you explain your reasoning with a clear example?',
                improvementSuggestion: 'Add a practical example and keep the explanation concise and structured.',
              };

          return (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <TrendingUp size={18} />
                <h3 className="font-semibold">AI Evaluation</h3>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {Object.entries(summary.scores || {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-white p-3 text-sm text-slate-700 border border-slate-200">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{key}</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{Number(value) || 0}/10</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-700"><strong>Feedback:</strong> {summary.feedback}</p>
              <p className="mt-2 text-sm text-slate-700"><strong>Follow-up:</strong> {summary.followUpQuestion}</p>
              <p className="mt-2 text-sm text-slate-700"><strong>Suggestion:</strong> {summary.improvementSuggestion}</p>
            </div>
          );
        })() : null}

        {report ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Star size={18} />
              <h3 className="font-semibold">Final Interview Report</h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 border border-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-500">Overall score</div>
                <div className="mt-1 text-3xl font-bold text-slate-900">{report.overallPerformanceScore}/10</div>
                <div className="mt-2 text-sm text-slate-600">Questions attempted: {report.totalQuestionsAttempted}</div>
              </div>
              <div className="rounded-xl bg-white p-4 border border-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-500">Topic-wise performance</div>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {report.topicWisePerformance?.map((metric) => (
                    <div key={metric.topic} className="flex items-center justify-between gap-2">
                      <span>{metric.topic}</span>
                      <span className="font-semibold">{metric.score}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900">Strong areas</h4>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-700 space-y-1">
                  {report.strongAreas?.map((area) => <li key={area}>{area}</li>)}
                </ul>
              </div>
              <div className="rounded-xl bg-white p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900">Areas to improve</h4>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-700 space-y-1">
                  {report.areasRequiringImprovement?.map((area) => <li key={area}>{area}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900">Improved sample answers</h4>
              <div className="mt-3 space-y-3">
                {report.sampleAnswers?.map((item) => (
                  <div key={`${item.number}-${item.question}`} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-medium text-slate-800">Q{item.number}: {item.question}</div>
                    <div className="mt-2 text-sm text-slate-700">{item.improvedAnswer}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900">Personalized preparation suggestions</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-700 space-y-1">
                {report.personalizedSuggestions?.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock3 className="text-orange-500" size={18} />
          <h2 className="text-xl font-semibold text-slate-900">Previous Mock Interview History</h2>
        </div>
        {loadingHistory ? <p className="mt-4 text-sm text-slate-600">Loading interviews...</p> : null}
        {!loadingHistory && !history.length ? <p className="mt-4 text-sm text-slate-600">No previous mock interviews yet. Start one to build your preparation history.</p> : null}
        <div className="mt-4 space-y-3">
          {history.map((entry) => (
            <div key={entry.sessionId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{entry.interviewType} · {entry.domain}</div>
                  <div className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()} · {entry.totalQuestions} questions</div>
                </div>
                <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{entry.status}</div>
              </div>
              {entry.report ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-semibold">Overall performance</span>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{entry.report.overallPerformanceScore}/10</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <ChevronRight size={16} />
                    <span>{entry.report.strongAreas?.[0] || 'Strong communication and preparation potential.'}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
