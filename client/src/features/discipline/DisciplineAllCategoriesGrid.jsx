import { Clock, User } from 'lucide-react';
import { DISCIPLINE_CATEGORIES } from '../../utils/constants';

const scoreColor = (score) => {
  const n = Number(score);
  if (n >= 8) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
  if (n >= 5) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
  return 'text-red-600 bg-red-50 dark:bg-red-900/30';
};

const formatTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

function CategoryBlock({ categoryKey, catDef, data, onUpdateItem, onCategoryRemarks }) {
  const items = data?.items || [];
  const avg =
    items.length > 0
      ? Math.round((items.reduce((s, i) => s + Number(i.score || 0), 0) / items.length) * 10)
      : 0;

  const teacherName =
    data?.recordedBy?.name || items.find((i) => i.recordedByName)?.recordedByName || '—';

  return (
    <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <header className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
            {catDef.letter}
          </span>
          <div>
            <h3 className="font-semibold text-sm">{catDef.label}</h3>
            <p className="text-xs text-slate-500">{items.length} items · Avg {avg}/100</p>
          </div>
        </div>
        {data?.updatedAt && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated {formatTime(data.updatedAt)}
          </span>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase tracking-wide bg-slate-50/50 dark:bg-slate-800/30">
              <th className="p-3 font-medium w-[28%]">Item</th>
              <th className="p-3 font-medium w-[18%]">Score (0–10)</th>
              <th className="p-3 font-medium w-[28%]">Remarks</th>
              <th className="p-3 font-medium w-[14%]">Timestamp</th>
              <th className="p-3 font-medium w-[12%]">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.key}
                className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.label}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className={`w-12 text-center font-bold rounded-md border-0 py-1 ${scoreColor(item.score)}`}
                      value={item.score}
                      onChange={(e) =>
                        onUpdateItem(categoryKey, item.key, 'score', Math.min(10, Math.max(0, Number(e.target.value))))
                      }
                    />
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={item.score}
                      onChange={(e) => onUpdateItem(categoryKey, item.key, 'score', Number(e.target.value))}
                      className="flex-1 min-w-[60px] accent-primary-600"
                    />
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    className="input text-xs py-1.5 w-full"
                    placeholder="Comments..."
                    value={item.remarks || ''}
                    onChange={(e) => onUpdateItem(categoryKey, item.key, 'remarks', e.target.value)}
                  />
                </td>
                <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                  {formatTime(item.recordedAt)}
                </td>
                <td className="p-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[100px]" title={item.recordedByName || teacherName}>
                      {item.recordedByName || teacherName || '—'}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
        <label className="label text-xs">Category remarks</label>
        <textarea
          className="input text-sm py-2"
          rows={2}
          placeholder={`Notes for ${catDef.label}...`}
          value={data?.remarks || ''}
          onChange={(e) => onCategoryRemarks(categoryKey, e.target.value)}
        />
      </div>
    </section>
  );
}

export default function DisciplineAllCategoriesGrid({ categories, onUpdateItem, onCategoryRemarks }) {
  return (
    <div className="card p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold">All Discipline Categories</h2>
        <p className="text-xs text-slate-500">A–E displayed together · score, remarks, time & teacher per item</p>
      </div>

      <div className="space-y-4">
        {Object.entries(DISCIPLINE_CATEGORIES).map(([key, catDef]) => (
          <CategoryBlock
            key={key}
            categoryKey={key}
            catDef={catDef}
            data={categories[key]}
            onUpdateItem={onUpdateItem}
            onCategoryRemarks={onCategoryRemarks}
          />
        ))}
      </div>
    </div>
  );
}
