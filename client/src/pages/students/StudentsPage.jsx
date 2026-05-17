import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import StudentForm from '../../features/students/StudentForm';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', {
        params: { page, limit: 20, search: search || undefined, class: classFilter || undefined },
      });
      setStudents(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [page, search, classFilter]);

  const handleCreate = async (formData) => {
    await api.post('/students', formData);
    toast.success('Student created');
    setModalOpen(false);
    fetchStudents();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-slate-500 text-sm">Manage student profiles</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          className="input sm:w-40"
          placeholder="Filter class"
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left p-4 font-medium">Student</th>
                <th className="text-left p-4 font-medium">Roll No</th>
                <th className="text-left p-4 font-medium">Class</th>
                <th className="text-left p-4 font-medium">House</th>
                <th className="text-left p-4 font-medium">Score</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No students found</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <Link to={`/students/${s._id}`} className="flex items-center gap-3">
                        {s.photo ? (
                          <img src={s.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                        )}
                        <span className="font-medium hover:text-primary-600">{s.fullName}</span>
                      </Link>
                    </td>
                    <td className="p-4">{s.rollNumber}</td>
                    <td className="p-4">{s.class}</td>
                    <td className="p-4">
                      {s.house ? (
                        <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${s.house.color}20`, color: s.house.color }}>
                          {s.house.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 font-bold text-primary-600">{s.finalScore}</td>
                    <td className="p-4">
                      <Link
                        to={`/discipline?student=${s._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300"
                        title="Open discipline"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Discipline
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 flex justify-center gap-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm">Prev</button>
            <span className="px-3 py-2 text-sm">Page {page} of {pagination.pages}</span>
            <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm">Next</button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Student">
        <StudentForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
