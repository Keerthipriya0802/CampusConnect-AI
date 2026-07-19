import { useState } from 'react';

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: 'Computer Science',
    cgpa: '8.7',
    skills: 'React, Node.js, MongoDB',
    experience: 'Completed coding round and technical interview',
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Student Profile</h1>
      <p className="mt-2 text-sm text-slate-600">Keep your profile updated so coordinators can track your progress better.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-slate-300 px-3 py-2" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Department" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="CGPA" value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })} />
        <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Skills" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
        <textarea className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" rows="3" placeholder="Interview / round experience" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} />
      </div>
      <button className="mt-6 rounded-full bg-blue-600 px-4 py-2 text-white">Save Profile</button>
    </div>
  );
}
