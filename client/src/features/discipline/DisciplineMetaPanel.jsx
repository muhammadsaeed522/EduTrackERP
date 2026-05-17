import { AlertTriangle, FileText, Gavel, Banknote, ClipboardList } from 'lucide-react';
import { BEHAVIOR_STATUS, DISCIPLINARY_ACTIONS, ATTENDANCE_STATUSES } from '../../utils/constants';
import { PENALTY_TYPES, BONUS_TYPES } from '../../utils/constants';

const behaviorColors = {
  excellent: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  good: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  satisfactory: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
  warning: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
};

export default function DisciplineMetaPanel({ session, setSession, penalty, setPenalty, bonus, setBonus }) {
  const toggleAction = (value) => {
    const current = session.disciplinaryActions || [];
    const next = current.includes(value)
      ? current.filter((a) => a !== value)
      : [...current, value];
    setSession({ ...session, disciplinaryActions: next });
  };

  return (
    <div className="space-y-4">
      {/* Behavior status */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Behavior Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {BEHAVIOR_STATUS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setSession({ ...session, behaviorStatus: b.value })}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                session.behaviorStatus === b.value
                  ? behaviorColors[b.value]
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {/* Warnings & actions */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">Warnings & Disciplinary Actions</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Warnings issued</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Describe any warnings given today..."
              value={session.warnings}
              onChange={(e) => setSession({ ...session, warnings: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Disciplinary actions taken</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DISCIPLINARY_ACTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => toggleAction(a.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    session.disciplinaryActions?.includes(a.value)
                      ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Action notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Details of disciplinary actions..."
              value={session.actionNotes}
              onChange={(e) => setSession({ ...session, actionNotes: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Fines */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold">Fines</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Fine amount</label>
            <input
              type="number"
              min={0}
              className="input"
              value={session.fineAmount}
              onChange={(e) => setSession({ ...session, fineAmount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Fine remarks</label>
            <input
              className="input"
              placeholder="Reason for fine..."
              value={session.fineRemarks}
              onChange={(e) => setSession({ ...session, fineRemarks: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Attendance discipline */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold">Attendance Discipline</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={session.attendanceDiscipline?.status || ''}
              onChange={(e) =>
                setSession({
                  ...session,
                  attendanceDiscipline: {
                    ...session.attendanceDiscipline,
                    status: e.target.value,
                    isLate: e.target.value === 'late',
                  },
                })
              }
            >
              <option value="">Not set</option>
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={session.attendanceDiscipline?.isLate || false}
                onChange={(e) =>
                  setSession({
                    ...session,
                    attendanceDiscipline: { ...session.attendanceDiscipline, isLate: e.target.checked },
                  })
                }
                className="rounded"
              />
              <span className="text-sm">Marked late</span>
            </label>
          </div>
          <div className="sm:col-span-3">
            <label className="label">Attendance remarks</label>
            <input
              className="input"
              value={session.attendanceDiscipline?.remarks || ''}
              onChange={(e) =>
                setSession({
                  ...session,
                  attendanceDiscipline: { ...session.attendanceDiscipline, remarks: e.target.value },
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Penalty inline */}
      <section className="card p-5">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={penalty.enabled}
            onChange={(e) => setPenalty({ ...penalty, enabled: e.target.checked })}
            className="rounded"
          />
          <span className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Add penalty for this session
          </span>
        </label>
        {penalty.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="input"
              value={penalty.severity}
              onChange={(e) => setPenalty({ ...penalty, severity: e.target.value, type: '' })}
            >
              {Object.keys(PENALTY_TYPES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={penalty.type}
              onChange={(e) => setPenalty({ ...penalty, type: e.target.value })}
            >
              <option value="">Select violation</option>
              {PENALTY_TYPES[penalty.severity]?.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <textarea
              className="input sm:col-span-2"
              rows={2}
              placeholder="Penalty remarks..."
              value={penalty.remarks}
              onChange={(e) => setPenalty({ ...penalty, remarks: e.target.value })}
            />
          </div>
        )}
      </section>

      {/* Bonus inline */}
      <section className="card p-5">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={bonus.enabled}
            onChange={(e) => setBonus({ ...bonus, enabled: e.target.checked })}
            className="rounded"
          />
          <span className="font-semibold">Add bonus for this session</span>
        </label>
        {bonus.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="input"
              value={bonus.type}
              onChange={(e) => setBonus({ ...bonus, type: e.target.value })}
            >
              {BONUS_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} (+{b.points})
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Bonus remarks..."
              value={bonus.remarks}
              onChange={(e) => setBonus({ ...bonus, remarks: e.target.value })}
            />
          </div>
        )}
      </section>

      {/* General notes */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold">Notes & Remarks</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">General remarks</label>
            <textarea
              className="input"
              rows={2}
              value={session.generalRemarks}
              onChange={(e) => setSession({ ...session, generalRemarks: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Teacher notes (internal)</label>
            <textarea
              className="input"
              rows={2}
              value={session.teacherNotes}
              onChange={(e) => setSession({ ...session, teacherNotes: e.target.value })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
