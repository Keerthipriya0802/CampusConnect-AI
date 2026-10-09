import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  MapPin,
  MessageSquareQuote,
  Search,
  Sparkles,
  UserCircle2,
} from 'lucide-react';
import './Dashboard.css';

export default function StudentDashboard({ user }) {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [higherPackageDrives, setHigherPackageDrives] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [experience, setExperience] = useState('');
  const [submittedExperience, setSubmittedExperience] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sharedExperiences] = useState([
    { drive: 'Infosys - SDE', note: 'Focus on DSA, React fundamentals, and communication.' },
    { drive: 'TCS NQT', note: 'Prepare for reasoning, coding basics, and verbal ability.' },
  ]);

  useEffect(() => {
    Promise.allSettled([
      api.get('/drives'),
      api.get('/materials'),
      api.get('/applications/my-applications'),
      api.get('/students/my-placement'),
      api.get('/students/higher-package-drives'),
      api.get('/students/profile'),
    ]).then(([driveResult, materialResult, applicationResult, placementResult, higherDrivesResult, profileResult]) => {
      setDrives(driveResult.status === 'fulfilled' ? (driveResult.value.data || []) : []);
      setMaterials(materialResult.status === 'fulfilled' ? (materialResult.value.data || []) : []);
      setApplications(applicationResult.status === 'fulfilled' ? (applicationResult.value.data || []) : []);
      setPlacement(placementResult.status === 'fulfilled' ? (placementResult.value.data || null) : null);
      setHigherPackageDrives(higherDrivesResult.status === 'fulfilled' ? (higherDrivesResult.value.data || []) : []);
      setStudentProfile(profileResult.status === 'fulfilled' ? profileResult.value.data : null);
    });
  }, []);

  const isPlaced = Boolean(placement?.placement?.company);
  const displayDrives = isPlaced ? higherPackageDrives : drives.filter((drive) => drive.status === 'open');
  const upcomingInterviews = drives
    .filter((drive) => drive.interviewDate && drive.status === 'open')
    .slice(0, 3)
    .map((drive) => ({
      company: drive.company,
      role: drive.role || drive.title,
      date: drive.interviewDate,
      time: '10:00 AM',
      round: 'Technical Round',
      mode: drive.location || 'Virtual',
    }));

  const completionFields = [
    studentProfile?.name?.trim(),
    studentProfile?.email?.trim(),
    studentProfile?.department?.trim(),
    studentProfile?.phone?.trim(),
    studentProfile?.cgpa,
    studentProfile?.arrears,
    studentProfile?.tenthPercentage,
    studentProfile?.twelfthPercentage,
  ];
  const completedFields = completionFields.filter((value) => (
    typeof value === 'number' ? Number.isFinite(value) : Boolean(value)
  )).length;
  const profileCompletion = Math.round((completedFields / completionFields.length) * 100);
  const journeySteps = ['Profile', 'Applied', 'Shortlisted', 'Interview', 'Selected'];
  const currentJourneyIndex = applications.some((application) => ['Selected', 'Offered'].includes(application.status))
    ? 4
    : applications.some((application) => ['Shortlisted', 'Interview'].includes(application.status))
      ? 3
      : applications.length
        ? 1
        : 0;

  const notifications = [
    ...displayDrives.slice(0, 2).map((drive) => ({
      title: `${drive.company} drive closes soon`,
      detail: `Apply by ${formatDate(drive.deadline)}.`,
      type: 'Deadline',
    })),
    {
      title: upcomingInterviews[0] ? `${upcomingInterviews[0].company} interview scheduled` : 'New interview updates',
      detail: upcomingInterviews[0]
        ? `${upcomingInterviews[0].round} on ${formatDate(upcomingInterviews[0].date)}.`
        : 'Check your schedule for the latest updates.',
      type: 'Interview',
    },
  ];

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: aiQuestion });
      setAiAnswer(res.data.reply);
    } catch (error) {
      setAiAnswer(error.response?.data?.message || 'The assistant is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="dashboard-page student-dashboard space-y-6">
      <div className="dashboard-hero rounded-3xl p-6 text-white shadow-xl">
        <span className="dashboard-eyebrow">Student workspace</span>
        <h1 className="text-2xl font-semibold">Hello, {studentProfile?.name || user?.name || 'Student'}.</h1>
        <p className="mt-2">Track drives, interviews, and offers in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Briefcase />} title="Upcoming Drives" value={displayDrives.length} />
        <StatCard icon={<FileText />} title="Applications" value={applications.length} />
        <StatCard icon={<CalendarDays />} title="Interviews" value={upcomingInterviews.length} />
        <StatCard icon={<CheckCircle2 />} title="Offer Letters" value={placement?.placement?.offerLetter ? 1 : 0} />
      </div>

      {isPlaced ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your Current Placement</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoBox label="Placement Status" value="Placed" />
            <InfoBox label="Company" value={placement.placement.company} />
            <InfoBox label="Package" value={`₹${placement.placement.package || 0} LPA`} />
            <InfoBox label="Offer Letter" value={placement.placement.offerLetterStatus || 'Pending'} />
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Based on placement policy: minimum package for new opportunities is ₹{Number(placement.placement.package || 0) * 2} LPA.
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Placement Status</h2>
          <p className="mt-2 text-sm text-slate-600">Not Placed</p>
        </div>
      )}

      {isPlaced ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Higher Package Opportunities</h2>
          <div className="mt-4 space-y-3">
            {higherPackageDrives.length ? (
              higherPackageDrives.slice(0, 5).map((drive) => (
                <div key={drive._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{drive.company}</p>
                      <p className="text-sm text-blue-700">{drive.role || drive.title}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      ₹{drive.package || drive.salaryPackage || 0} LPA
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500">{drive.location || 'Campus / virtual'}</span>
                    <Link to={`/drives/${drive._id}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No higher package opportunity is currently available.</p>
            )}
          </div>
        </div>
      ) : null}

      {placement?.placement?.company ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Offer Letter</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoBox label="Company" value={placement.placement.company} />
            <InfoBox label="Package" value={`₹${placement.placement.package || 0} LPA`} />
            <InfoBox label="Status" value={placement.placement.offerLetterStatus || 'Pending'} />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Actions</p>
              {placement.placement.offerLetter ? (
                <div className="mt-3 flex gap-2">
                  <a href={`http://localhost:5000${placement.placement.offerLetter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white">
                    <Eye size={12} /> View
                  </a>
                  <a href={`http://localhost:5000${placement.placement.offerLetter}`} download className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                    <Download size={12} /> Download
                  </a>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No offer letter uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isPlaced ? 'Higher Package Opportunities' : 'Available Placement Drives'}</h2>
            <Link to="/drives" className="flex items-center gap-1 text-sm font-medium text-blue-700">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {displayDrives.slice(0, 3).map((drive, index) => (
              <div key={drive._id || `${drive.company}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{drive.company}</p>
                    <p className="text-sm text-blue-700">{drive.role || drive.title}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Open</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <span>Eligibility: {drive.eligibility || 'Eligible students'}</span>
                  <span>Deadline: {formatDate(drive.deadline)}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {drive.location || 'Campus / virtual'}
                  </span>
                  <span>Package: {drive.package || drive.salaryPackage || 'As per company'}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={drive._id ? `/drives/${drive._id}` : '/drives'} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                    View Details
                  </Link>
                  <Link to={drive._id ? `/drives/${drive._id}` : '/drives'} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white">
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile completion</h2>
              <p className="mt-1 text-sm text-slate-500">Complete your profile to improve eligibility.</p>
            </div>
            <span className="text-2xl font-semibold text-blue-700">{profileCompletion}%</span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{completedFields} of {completionFields.length} required profile fields complete</p>
          <Link to="/profile" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            <UserCircle2 size={16} /> Update profile
          </Link>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <QuickAction to="/drives" icon={<Search size={16} />} label="Browse Drives" />
              <QuickAction to="/applications" icon={<FileText size={16} />} label="My Applications" />
              <QuickAction to="/interview-prep" icon={<CalendarDays size={16} />} label="Interview Schedule" />
              <QuickAction to="/offer-letters" icon={<CheckCircle2 size={16} />} label="Offer Letters" />
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
              <p className="mt-1 text-sm text-slate-500">Your next placement milestones.</p>
            </div>
            <Clock3 className="text-blue-600" size={20} />
          </div>
          <div className="mt-4 space-y-3">
            {upcomingInterviews.map((interview, index) => (
              <div key={`${interview.company}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {interview.company} <span className="font-normal text-slate-500">· {interview.round}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{interview.role} · {interview.mode}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-blue-700">{formatDate(interview.date)}</p>
                  <p className="text-slate-500">{interview.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Placement Journey</h2>
          <p className="mt-1 text-sm text-slate-500">Keep moving toward your next opportunity.</p>
          <div className="mt-6 flex items-start justify-between">
            {journeySteps.map((step, index) => (
              <div key={step} className="flex min-w-0 flex-1 flex-col items-center text-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index <= currentJourneyIndex ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {index < currentJourneyIndex ? <CheckCircle2 size={17} /> : index + 1}
                </div>
                <p className={`mt-2 text-xs ${index <= currentJourneyIndex ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 rounded-full bg-slate-100">
            <div className="h-1 rounded-full bg-blue-600 transition-all" style={{ width: `${(currentJourneyIndex / 4) * 100}%` }} />
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Important Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">Stay ahead of placement activity.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{notifications.length} updates</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {notifications.map((notification, index) => (
            <div key={`${notification.title}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">{notification.type}</span>
              <p className="mt-2 font-medium text-slate-900">{notification.title}</p>
              <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">Share your interview experience</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">After each round, share what happened so coordinators can guide you better.</p>
        <textarea
          className="mt-4 w-full rounded-2xl border border-slate-300 px-3 py-2"
          rows="3"
          placeholder="Describe your latest round experience..."
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white" onClick={() => { setSubmittedExperience(experience); setExperience(''); }}>
          Submit Experience
        </button>
        {submittedExperience ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Latest update: {submittedExperience}</p> : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold">AI Drive & Eligibility Assistant</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">Ask the AI about eligibility, drive requirements, and what to prepare next.</p>
        <input
          className="mt-4 w-full rounded-2xl border border-slate-300 px-3 py-2"
          placeholder="Ask: Am I eligible for Infosys SDE?"
          value={aiQuestion}
          onChange={(e) => setAiQuestion(e.target.value)}
        />
        <button className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-white disabled:opacity-60" onClick={handleAskAI} disabled={aiLoading || !aiQuestion.trim()}>{aiLoading ? 'Waiting for AI...' : 'Ask AI'}</button>
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
              <a href={`http://localhost:5000${material.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-full bg-blue-600 px-3 py-2 text-white">
                Download
              </a>
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

function formatDate(value) {
  if (!value) return 'TBA';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function QuickAction({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
      {icon}
      {label}
      <ChevronRight size={15} className="ml-auto" />
    </Link>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

