export default function CoordinatorProfilePage({ user }) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">Coordinator Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Your account information and placement coordination profile.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user?.name || 'Placement Coordinator'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user?.email || 'placement@college.edu'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Phone Number</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user?.phone || '9876543210'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Placement Coordinator</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Department</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Training & Placement</p>
        </div>
      </div>

      <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Edit Profile</button>
    </div>
  );
}
