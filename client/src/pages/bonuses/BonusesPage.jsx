import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { fetchAllStudents } from '../../services/studentService';
import Modal from '../../components/ui/Modal';
import { BONUS_TYPES } from '../../utils/constants';

export default function BonusesPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState('');
  const [bonuses, setBonuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'cleanliness', remarks: '' });

  useEffect(() => {
    fetchAllStudents().then(setStudents);
  }, []);

  const load = async (id) => {
    setSelected(id);
    if (!id) return;
    const { data } = await api.get(`/bonuses/${id}`);
    setBonuses(data.data);
  };

  const save = async (e) => {
    e.preventDefault();
    const bonus = BONUS_TYPES.find((b) => b.value === form.type);
    try {
      await api.post('/bonuses', { student: selected, type: form.type, points: bonus?.points, remarks: form.remarks });
      toast.success('Bonus recorded');
      setModalOpen(false);
      load(selected);
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Bonus System</h1>
        <button type="button" className="btn-primary" disabled={!selected} onClick={() => setModalOpen(true)}>Add Bonus</button>
      </div>
      <div className="card p-4">
        <select className="input max-w-md" value={selected} onChange={(e) => load(e.target.value)}>
          <option value="">Select student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {bonuses.map((b) => (
          <div key={b._id} className="card p-4 flex justify-between">
            <p className="font-medium capitalize">{b.type.replace(/_/g, ' ')}</p>
            <span className="text-emerald-600 font-bold">+{b.points}</span>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Bonus">
        <form onSubmit={save} className="space-y-4">
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {BONUS_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label} (+{b.points})</option>)}
          </select>
          <textarea className="input" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}
