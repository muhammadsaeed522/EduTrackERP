import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fetchAllStudents } from '../../services/studentService';
import Modal from '../../components/ui/Modal';

export default function AcademicsPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState('');
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ term: 'Term 1', subject: '', score: '', maxScore: '100', type: 'test' });

  useEffect(() => {
    fetchAllStudents().then(setStudents);
  }, []);

  const load = async (id) => {
    setSelected(id);
    if (!id) return;
    const { data } = await api.get(`/academics/${id}`);
    setRecords(data.data);
  };

  const save = async (e) => {
    e.preventDefault();
    const existing = records[0];
    const marks = existing?.marks ? [...existing.marks] : [];
    marks.push({
      subject: form.subject,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      type: form.type,
    });
    try {
      if (existing) {
        await api.put(`/academics/${existing._id}`, { student: selected, term: form.term, marks });
      } else {
        await api.post('/academics', { student: selected, term: form.term, marks });
      }
      toast.success('Academic record saved');
      setModalOpen(false);
      load(selected);
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academic Performance</h1>
          <p className="text-slate-500 text-sm">Track marks, GPA, and progress</p>
        </div>
        <button type="button" className="btn-primary" disabled={!selected} onClick={() => setModalOpen(true)}>Add Marks</button>
      </div>
      <div className="card p-4">
        <label className="label">Student</label>
        <select className="input max-w-md" value={selected} onChange={(e) => load(e.target.value)}>
          <option value="">Select student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
        </select>
      </div>
      {records.map((r) => (
        <div key={r._id} className="card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">{r.term}</h3>
            <span className="text-primary-600 font-bold">GPA: {r.gpa} | {r.percentage}%</span>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th className="pb-2">Subject</th><th>Score</th><th>Type</th></tr></thead>
            <tbody>
              {r.marks?.map((m, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2">{m.subject}</td>
                  <td>{m.score}/{m.maxScore}</td>
                  <td className="capitalize">{m.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Academic Marks">
        <form onSubmit={save} className="space-y-4">
          <input className="input" placeholder="Term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
          <input className="input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" placeholder="Score" required value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
            <input className="input" type="number" placeholder="Max" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
          </div>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['homework', 'test', 'participation', 'improvement'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}


