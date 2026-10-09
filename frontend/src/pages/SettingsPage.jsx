export default function SettingsPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-slate-600">Manage your account, placement preferences, and notifications.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 p-3">Change Password</div>
            <div className="rounded-xl border border-slate-200 p-3">Update Email</div>
            <div className="rounded-xl border border-slate-200 p-3">Update Phone Number</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Placement Settings</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 p-3">Academic Year</div>
            <div className="rounded-xl border border-slate-200 p-3">Current Student Batch</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 p-3">New Application Notifications</div>
            <div className="rounded-xl border border-slate-200 p-3">Interview Notifications</div>
            <div className="rounded-xl border border-slate-200 p-3">Offer Letter Notifications</div>
          </div>
        </section>
      </div>
    </div>
  );
}
