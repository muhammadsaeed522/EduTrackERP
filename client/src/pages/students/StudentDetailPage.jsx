import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudent(data.data);
    } catch {
      toast.error('Student not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const refreshScore = async () => {
    const { data } = await api.post(`/students/${id}/refresh-score`);
    toast.success(`Score updated: ${data.data.finalScore}`);
    load();
  };

  const downloadReport = async () => {
    try {
      const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `edutrack-${student.rollNumber}.pdf`;
      a.click();
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to generate report');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!student) return null;

  const b = student.scoreBreakdown || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/students" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-slate-500">{student.rollNumber} · {student.class}</p>
        </div>
        <button type="button" onClick={refreshScore} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Score
        </button>
        <button type="button" onClick={downloadReport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> PDF Report
        </button>
      </div>

      <div className="card p-6 flex flex-col md:flex-row gap-6 items-start">
        {student.photo ? (
          <img src={student.photo} alt="" className="w-32 h-32 rounded-xl object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-xl bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600">
            {student.fullName[0]}
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">House</span><p className="font-medium">{student.house?.name || '—'}</p></div>
          <div><span className="text-slate-500">Contact</span><p className="font-medium">{student.contact || '—'}</p></div>
          <div><span className="text-slate-500">Guardian</span><p className="font-medium">{student.guardian?.name || '—'}</p></div>
          <div><span className="text-slate-500">Guardian Phone</span><p className="font-medium">{student.guardian?.phone || '—'}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Final Score" value={student.finalScore} color="primary" />
        <StatCard title="Academics" value={b.academics ?? 0} />
        <StatCard title="Discipline" value={b.discipline ?? 0} color="green" />
        <StatCard title="Attendance" value={b.attendance ?? 0} color="amber" />
        <StatCard title="Bonuses" value={`+${b.bonuses ?? 0}`} color="green" />
        <StatCard title="Penalties" value={`-${b.penalties ?? 0}`} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={`/attendance?student=${id}`} className="card p-4 hover:border-primary-300 transition text-center">Attendance</Link>
        <Link to={`/academics?student=${id}`} className="card p-4 hover:border-primary-300 transition text-center">Academics</Link>
        <Link to={`/discipline?student=${id}`} className="card p-4 hover:border-primary-300 transition text-center">Discipline</Link>
      </div>
    </div>
  );
}
