import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STATUSES = ['present', 'absent', 'late', 'excused'];

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classFilter, setClassFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/daily', { params: { date, class: classFilter || undefined } });
      setRows(data.data.map((r) => ({ ...r, status: r.attendance?.status || 'present' })));
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDaily(); }, [date, classFilter]);

  const save = async () => {
    try {
      await api.post('/attendance/bulk', {
        date,
        records: rows.map((r) => ({ student: r._id, status: r.status })),
      });
      toast.success('Attendance saved');
      fetchDaily();
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-slate-500 text-sm">Mark daily attendance</p>
      </div>
      <div className="card p-4 flex flex-wrap gap-4">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Class</label>
          <input className="input" placeholder="e.g. 10-A" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="button" onClick={save} className="btn-primary">Save All</button>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left p-4">Student</th>
              <th className="text-left p-4">Roll</th>
              <th className="text-left p-4">Class</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-4">{r.fullName}</td>
                <td className="p-4">{r.rollNumber}</td>
                <td className="p-4">{r.class}</td>
                <td className="p-4">
                  <select
                    className="input py-1"
                    value={r.status}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], status: e.target.value };
                      setRows(next);
                    }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
