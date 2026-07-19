import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function DriveDetailsPage({ user }) {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);

  useEffect(() => {
    api.get(`/drives/${id}`).then((res) => setDrive(res.data)).catch(() => setDrive(null));
  }, [id]);

  const apply = async () => {
    try {
      await api.post(`/drives/${id}/apply`, { resume: 'resume-link' });
      toast.success('Applied successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not apply');
    }
  };

  if (!drive) return <div className="rounded-3xl bg-white p-6 shadow-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{drive.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{drive.company}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <p>{drive.description}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Location" value={drive.location} />
          <Info label="Eligibility" value={drive.eligibility} />
          <Info label="Package" value={drive.package} />
          <Info label="Deadline" value={new Date(drive.deadline).toLocaleDateString()} />
        </div>
        {user?.role === 'student' ? (
          <button onClick={apply} className="rounded-full bg-blue-600 px-4 py-2 text-white">Apply Now</button>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
