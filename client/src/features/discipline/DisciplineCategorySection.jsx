import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function DisciplineCategorySection({
  title,
  description,
  items,
  categoryRemarks,
  onScoreChange,
  onItemRemarksChange,
  onCategoryRemarksChange,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const avg =
    items.length > 0
      ? Math.round((items.reduce((s, i) => s + Number(i.score || 0), 0) / items.length) * 10)
      : 0;

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
      >
        <div>
          <h3 className="font-semibold text-left">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5 text-left">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary-600">{avg}/100</span>
          {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
            {items.map((item) => (
              <div key={item.key} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-sm font-medium">{item.label}</label>
                  <span className="text-sm font-bold text-primary-600 w-8 text-right">{item.score}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={item.score}
                  onChange={(e) => onScoreChange(item.key, Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <input
                  type="text"
                  className="input text-xs py-1.5"
                  placeholder="Item remark..."
                  value={item.remarks || ''}
                  onChange={(e) => onItemRemarksChange(item.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="label">Section remarks</label>
            <textarea
              className="input text-sm"
              rows={2}
              placeholder={`Remarks for ${title}...`}
              value={categoryRemarks}
              onChange={(e) => onCategoryRemarksChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
