import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';

export default function StudentPortalPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (user?.studentProfile) {
      api.get(`/students/${user.studentProfile}`).then(({ data }) => setStudent(data.data));
    }
  }, [user]);

  const downloadReport = async () => {
    try {
      const res = await api.get(`/reports/${user.studentProfile}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-report.pdf';
      a.click();
    } catch {
      toast.error('Failed to download report');
    }
  };

  if (!student) return <p className="text-slate-500">Loading your profile...</p>;

  const b = student.scoreBreakdown || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {student.fullName}</h1>
          <p className="text-slate-500">{student.rollNumber} · {student.class} · {student.house?.name}</p>
        </div>
        <button type="button" onClick={downloadReport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> My Report
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Final Score" value={student.finalScore} />
        <StatCard title="Academics" value={b.academics ?? 0} />
        <StatCard title="Discipline" value={b.discipline ?? 0} color="green" />
        <StatCard title="Attendance" value={b.attendance ?? 0} color="amber" />
        <StatCard title="Bonuses" value={`+${b.bonuses ?? 0}`} color="green" />
        <StatCard title="Penalties" value={`-${b.penalties ?? 0}`} color="red" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/portal/attendance" className="card p-6 hover:border-primary-300 transition">
          <h3 className="font-semibold">My Attendance</h3>
          <p className="text-sm text-slate-500 mt-1">View attendance history</p>
        </Link>
        <Link to="/portal/academics" className="card p-6 hover:border-primary-300 transition">
          <h3 className="font-semibold">My Academics</h3>
          <p className="text-sm text-slate-500 mt-1">Grades and performance</p>
        </Link>
        <Link to="/portal/discipline" className="card p-6 hover:border-primary-300 transition">
          <h3 className="font-semibold">My Discipline</h3>
          <p className="text-sm text-slate-500 mt-1">Discipline records</p>
        </Link>
        <Link to="/portal/report" className="card p-6 hover:border-primary-300 transition">
          <h3 className="font-semibold">Download Report</h3>
          <p className="text-sm text-slate-500 mt-1">PDF performance report</p>
        </Link>
      </div>
    </div>
  );
}
