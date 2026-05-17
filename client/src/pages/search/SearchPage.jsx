import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../services/api';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get('/search', { params: { q } });
      setResults(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Search Students</h1>
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Roll number, name, or class..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
        </div>
        <button type="button" onClick={search} className="btn-primary">Search</button>
      </div>
      {loading && <p className="text-slate-500">Searching...</p>}
      <div className="grid gap-3">
        {results.map((s) => (
          <Link key={s._id} to={`/students/${s._id}`} className="card p-4 flex justify-between hover:border-primary-300">
            <div>
              <p className="font-medium">{s.fullName}</p>
              <p className="text-sm text-slate-500">{s.rollNumber} · {s.class}</p>
            </div>
            <span className="font-bold text-primary-600">{s.finalScore}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
