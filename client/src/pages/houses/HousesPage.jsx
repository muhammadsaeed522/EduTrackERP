import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#3B82F6', motto: '' });

  const load = () => api.get('/houses').then(({ data }) => setHouses(data.data));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/houses', form);
      toast.success('House created');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const declareWinner = async () => {
    try {
      const { data } = await api.post('/houses/weekly-winner');
      toast.success(`${data.data.name} wins this week!`);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">House Management</h1>
          <p className="text-slate-500 text-sm">Rankings & competitions</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={declareWinner} className="btn-secondary">Weekly Winner</button>
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">Add House</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {houses.map((h, i) => (
          <Link key={h._id} to={`/houses/${h._id}`} className="card p-6 hover:shadow-md transition" style={{ borderTop: `4px solid ${h.color}` }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-3xl font-bold text-slate-300">#{i + 1}</span>
                <h3 className="text-xl font-bold mt-1">{h.name}</h3>
                <p className="text-sm text-slate-500">{h.motto}</p>
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold" style={{ color: h.color }}>{h.totalPoints} pts</p>
            <p className="text-xs text-slate-500">{h.weeklyWins} weekly wins</p>
          </Link>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create House">
        <form onSubmit={create} className="space-y-4">
          <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <input className="input" placeholder="Motto" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </div>
  );
}
