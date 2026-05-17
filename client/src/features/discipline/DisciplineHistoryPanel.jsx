import { History } from 'lucide-react';

export default function DisciplineHistoryPanel({ history, summary, onSelectDate }) {
  return (
    <aside className="card p-4 lg:sticky lg:top-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-slate-500" />
        <h3 className="font-semibold">Session Summary</h3>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <p className="text-slate-500">Discipline</p>
            <p className="font-bold text-primary-600">{summary.avgDisciplineScore ?? '—'}</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-slate-500">Penalties</p>
            <p className="font-bold text-red-600">-{summary.penaltyPoints}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-slate-500">Bonuses</p>
            <p className="font-bold text-emerald-600">+{summary.bonusPoints}</p>
          </div>
        </div>
      )}

      <h4 className="text-sm font-medium text-slate-500 mb-2">Recent records</h4>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {history?.length === 0 && <p className="text-xs text-slate-400">No history yet</p>}
        {history?.map((r) => (
          <button
            key={r._id}
            type="button"
            onClick={() => onSelectDate?.(new Date(r.date).toISOString().slice(0, 10))}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          >
            <div className="flex justify-between">
              <span className="capitalize font-medium">{r.category?.replace(/_/g, ' ')}</span>
              <span className="text-primary-600 font-bold">{r.totalScore}</span>
            </div>
            <p className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString()}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
