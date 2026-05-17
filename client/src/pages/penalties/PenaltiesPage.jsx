import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fetchAllStudents } from '../../services/studentService';
import Modal from '../../components/ui/Modal';
import { PENALTY_TYPES } from '../../utils/constants';

const DEDUCTIONS = { minor: 5, serious: 15, major: 30 };

export default function PenaltiesPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState('');
  const [penalties, setPenalties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ severity: 'minor', type: '', remarks: '' });

  useEffect(() => {
    fetchAllStudents().then(setStudents);
  }, []);

  const load = async (id) => {
    setSelected(id);
    if (!id) return;
    const { data } = await api.get(`/penalties/${id}`);
    setPenalties(data.data);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/penalties', { student: selected, ...form, pointsDeducted: DEDUCTIONS[form.severity] });
      toast.success('Penalty recorded');
      setModalOpen(false);
      load(selected);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penalty System</h1>
          <p className="text-slate-500 text-sm">Minor, serious, and major violations</p>
        </div>
        <button type="button" className="btn-primary" disabled={!selected} onClick={() => setModalOpen(true)}>Add Penalty</button>
      </div>
      <div className="card p-4">
        <select className="input max-w-md" value={selected} onChange={(e) => load(e.target.value)}>
          <option value="">Select student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {penalties.map((p) => (
          <div key={p._id} className="card p-4 flex justify-between">
            <div>
              <p className="font-medium capitalize">{p.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-500 capitalize">{p.severity} · {new Date(p.date).toLocaleDateString()}</p>
            </div>
            <span className="text-red-600 font-bold">-{p.pointsDeducted}</span>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Penalty">
        <form onSubmit={save} className="space-y-4">
          <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value, type: '' })}>
            {Object.keys(PENALTY_TYPES).map((s) => <option key={s} value={s}>{s} (-{DEDUCTIONS[s]} pts)</option>)}
          </select>
          <select className="input" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="">Select type</option>
            {PENALTY_TYPES[form.severity]?.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea className="input" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}
