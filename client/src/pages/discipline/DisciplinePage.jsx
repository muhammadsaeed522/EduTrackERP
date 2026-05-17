import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, User, Calendar, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAllStudents } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { useDisciplineSession } from '../../hooks/useDisciplineSession';
import DisciplineAllCategoriesGrid from '../../features/discipline/DisciplineAllCategoriesGrid';
import DisciplineMetaPanel from '../../features/discipline/DisciplineMetaPanel';
import DisciplineHistoryPanel from '../../features/discipline/DisciplineHistoryPanel';

const normalizeId = (id) => (id == null ? '' : String(id));

export default function DisciplinePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = normalizeId(searchParams.get('student'));

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);

  const currentTeacher = user ? { id: user.id, name: user.name } : null;

  const {
    loading,
    saving,
    student,
    loadError,
    session,
    setSession,
    categories,
    penalty,
    setPenalty,
    bonus,
    setBonus,
    history,
    summary,
    selectedDate,
    setSelectedDate,
    load,
    save,
    updateItem,
    updateCategoryRemarks,
  } = useDisciplineSession(currentTeacher);

  useEffect(() => {
    let cancelled = false;
    setStudentsLoading(true);
    setStudentsError(null);
    fetchAllStudents()
      .then((list) => {
        if (!cancelled) setStudents(list);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err.response?.data?.message || 'Could not load student list';
          setStudentsError(msg);
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (studentId) {
      load(studentId, selectedDate);
    }
  }, [studentId, selectedDate, load]);

  const handleStudentChange = (id) => {
    const next = normalizeId(id);
    if (next) setSearchParams({ student: next });
    else setSearchParams({});
  };

  const handleSave = async () => {
    if (!studentId) {
      toast.error('Select a student first');
      return;
    }
    try {
      await save(studentId);
      toast.success('All discipline categories saved');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Save failed');
    }
  };

  const selectedInList = students.some((s) => normalizeId(s._id) === studentId);
  const displayStudent = student;

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-20 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Discipline Management</h1>
            <p className="text-slate-500 text-sm">
              Categories A–E on one page · score, remarks, timestamp & teacher per item
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!studentId || saving}
            className="btn-primary flex items-center justify-center gap-2 shrink-0"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Discipline Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="input pl-10"
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              disabled={studentsLoading}
            >
              <option value="">
                {studentsLoading
                  ? 'Loading students...'
                  : studentsError
                    ? 'Failed to load — refresh page'
                    : students.length === 0
                      ? 'No students found'
                      : `Select student (${students.length})`}
              </option>
              {students.map((s) => (
                <option key={normalizeId(s._id)} value={normalizeId(s._id)}>
                  {s.fullName} ({s.rollNumber}) — {s.class}
                </option>
              ))}
              {studentId && !selectedInList && displayStudent && (
                <option value={studentId}>
                  {displayStudent.fullName} ({displayStudent.rollNumber})
                </option>
              )}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="input pl-10"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!studentId}
            />
          </div>
          {studentId && displayStudent && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 shrink-0">
                {displayStudent.fullName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{displayStudent.fullName}</p>
                <p className="text-xs text-slate-500">
                  {displayStudent.rollNumber} · {displayStudent.class}
                  {displayStudent.house?.name ? ` · ${displayStudent.house.name}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Score</p>
                <p className="font-bold text-primary-600">{displayStudent.finalScore ?? '—'}</p>
              </div>
            </div>
          )}
        </div>
        {currentTeacher && (
          <p className="text-xs text-slate-500 mt-2">
            Recording as:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{currentTeacher.name}</span>
          </p>
        )}
      </div>

      {!studentId && (
        <div className="card p-12 text-center text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Select a student, or open one from the Students page.</p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/students')}>
            Go to Students
          </button>
        </div>
      )}

      {studentId && loading && (
        <p className="text-center text-slate-500 py-12">Loading discipline data...</p>
      )}

      {studentId && loadError && !loading && (
        <div className="card p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 mb-4">
          <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {loadError}
          </p>
          <button type="button" className="btn-secondary mt-3" onClick={() => load(studentId, selectedDate)}>
            Retry
          </button>
        </div>
      )}

      {studentId && !loading && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-6">
            <DisciplineAllCategoriesGrid
              categories={categories}
              onUpdateItem={updateItem}
              onCategoryRemarks={updateCategoryRemarks}
            />
            <DisciplineMetaPanel
              session={session}
              setSession={setSession}
              penalty={penalty}
              setPenalty={setPenalty}
              bonus={bonus}
              setBonus={setBonus}
            />
          </div>
          <DisciplineHistoryPanel
            history={history}
            summary={summary}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        </div>
      )}
    </div>
  );
}
