import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function StudentAttendanceView() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(`/attendance/${user.studentProfile}`).then(({ data }) => setData(data.data));
  }, [user]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Attendance</h1>
      {data?.summary && <p className="text-slate-500">{data.summary.percentage}% attendance ({data.summary.present}/{data.summary.total})</p>}
      <div className="card divide-y dark:divide-slate-800">
        {data?.records?.map((r) => (
          <div key={r._id} className="p-4 flex justify-between capitalize">
            <span>{new Date(r.date).toLocaleDateString()}</span>
            <span>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentAcademicsView() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  useEffect(() => {
    api.get(`/academics/${user.studentProfile}`).then(({ data }) => setRecords(data.data));
  }, [user]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Academics</h1>
      {records.map((r) => (
        <div key={r._id} className="card p-6">
          <p className="font-semibold">{r.term} — GPA {r.gpa} ({r.percentage}%)</p>
          <ul className="mt-2 text-sm space-y-1">
            {r.marks?.map((m, i) => <li key={i}>{m.subject}: {m.score}/{m.maxScore}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function StudentDisciplineView() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  useEffect(() => {
    api.get(`/discipline/${user.studentProfile}`).then(({ data }) => setRecords(data.data));
  }, [user]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Discipline</h1>
      {records.map((r) => (
        <div key={r._id} className="card p-4 flex justify-between">
          <span className="capitalize">{r.category.replace(/_/g, ' ')}</span>
          <span className="font-bold">{r.totalScore}/100</span>
        </div>
      ))}
    </div>
  );
}

export function StudentReportView() {
  const { user } = useAuth();
  const download = async () => {
    const res = await api.get(`/reports/${user.studentProfile}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    a.click();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Report</h1>
      <p className="text-slate-500">Download your complete performance report as PDF.</p>
      <button type="button" onClick={download} className="btn-primary">Download PDF Report</button>
    </div>
  );
}
