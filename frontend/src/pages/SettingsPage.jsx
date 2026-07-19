export default function SettingsPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-slate-600">Configure your portal preferences and integrations.</p>
      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-slate-200 p-4">Email notifications enabled</div>
        <div className="rounded-2xl border border-slate-200 p-4">AI assistant enabled</div>
        <div className="rounded-2xl border border-slate-200 p-4">Offer letter upload enabled</div>
      </div>
    </div>
  );
}
