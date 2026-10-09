import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Briefcase, Bot, ShieldCheck } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="landing-brand-mark rounded-2xl p-2"><Sparkles size={20} /></div>
          <div>
            <p className="font-semibold">CampusConnect <strong>AI</strong></p>
            <p className="text-sm">Placement Portal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="landing-login rounded-full px-4 py-2 text-sm font-medium">Login</Link>
          <Link to="/login" className="landing-primary rounded-full px-4 py-2 text-sm font-medium">Sign in <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
        <section className="landing-hero space-y-6">
          <div className="landing-kicker inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <Sparkles size={16} /> AI-powered campus placement management
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Your next opportunity, <em>better connected.</em>
          </h1>
          <p className="max-w-xl text-lg">
            From creating placement drives to tracking offer letters, CampusConnect AI helps coordinators and students stay aligned with a modern, smart experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="landing-primary rounded-full px-5 py-3 font-medium">Sign in to continue <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="landing-feature-panel rounded-3xl p-6">
          <div className="grid gap-4">
            <div className="landing-feature rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2"><Briefcase size={18} /> Placement Drive Management</div>
              <p className="text-sm">Create drives, manage registrations, and track every step in one place.</p>
            </div>
            <div className="landing-feature rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2"><Bot size={18} /> AI Placement Assistant</div>
              <p className="text-sm">Students can ask questions, get guidance, and receive interview preparation support.</p>
            </div>
            <div className="landing-feature rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2"><ShieldCheck size={18} /> Offer Tracking</div>
              <p className="text-sm">Manage and review offer letters without scattered files or manual updates.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
