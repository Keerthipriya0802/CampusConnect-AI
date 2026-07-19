import { useState } from 'react';

export default function InterviewPrepPage() {
  const [topic, setTopic] = useState('React');
  const questions = [
    'What is the difference between props and state?',
    'Explain the lifecycle of a React component.',
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">AI Interview Preparation</h1>
      <p className="mt-2 text-sm text-slate-600">Prepare for interviews with targeted questions and guidance.</p>
      <div className="mt-6 flex gap-3">
        <input className="rounded-xl border border-slate-300 px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <button className="rounded-full bg-blue-600 px-4 py-2 text-white">Generate Questions</button>
      </div>
      <div className="mt-6 space-y-3">
        {questions.map((q, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">{q}</div>
        ))}
      </div>
    </div>
  );
}
