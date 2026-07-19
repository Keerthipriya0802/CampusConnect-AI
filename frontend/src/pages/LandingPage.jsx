import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Briefcase, Bot, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-2 text-white"><Sparkles size={20} /></div>
          <div>
            <p className="font-semibold text-slate-800">CampusConnect AI</p>
            <p className="text-sm text-slate-500">Placement Portal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Login</Link>
          <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Get Started</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Sparkles size={16} /> AI-powered campus placement management
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Simplify placements with intelligent automation and real-time tracking.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            From creating placement drives to tracking offer letters, CampusConnect AI helps coordinators and students stay aligned with a modern, smart experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="rounded-full bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-100">Join as Student</Link>
            <Link to="/register" className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-700">Join as Coordinator</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700"><Briefcase size={18} /> Placement Drive Management</div>
              <p className="text-sm text-slate-600">Create drives, manage registrations, and track every step in one place.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700"><Bot size={18} /> AI Placement Assistant</div>
              <p className="text-sm text-slate-600">Students can ask questions, get guidance, and receive interview preparation support.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700"><ShieldCheck size={18} /> Offer Tracking</div>
              <p className="text-sm text-slate-600">Manage and review offer letters without scattered files or manual updates.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
