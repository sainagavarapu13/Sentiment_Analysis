import React, { useState } from 'react';
import { CategoryMetric } from '../../types/sentiment';
import { BarChart2 } from 'lucide-react';

interface CategoryBarChartProps {
  categories: CategoryMetric[];
  onSelectCategory?: (category: string) => void;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categories,
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full min-h-[240px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Top Reviewed Products & Categories</h3>
            <p className="text-xs text-slate-400">Cross-entity review volume & sentiment proportion</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
            0 Entities
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center mb-2.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200">No entities analyzed yet.</p>
          <span className="text-xs text-slate-400 mt-1">
            Detected product, item, or category columns will appear here
          </span>
        </div>

        <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 text-center">
          Upload and analyze a dataset to view entity breakdown
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...categories.map((c) => c.total), 1);

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">Top Reviewed Products & Entities</h3>
          <p className="text-xs text-slate-400">Cross-entity review volume & sentiment distribution</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" /> Positive
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" /> Neutral
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" /> Negative
          </span>
        </div>
      </div>

      {/* Floating Mini-Cards for each entity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {categories.map((cat, idx) => {
          const isHovered = hoveredCategory === cat.category;
          const posPct = cat.total > 0 ? (cat.positive / cat.total) * 100 : 0;
          const neuPct = cat.total > 0 ? (cat.neutral / cat.total) * 100 : 0;
          const negPct = cat.total > 0 ? (cat.negative / cat.total) * 100 : 0;

          return (
            <div
              key={cat.category + idx}
              onMouseEnter={() => setHoveredCategory(cat.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onSelectCategory && onSelectCategory(cat.category)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'bg-slate-800/80 border-cyan-400/40 shadow-[0_10px_25px_-5px_rgba(6,182,212,0.15)] transform -translate-y-0.5'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-tight">{cat.category}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      Top Entity
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300 font-mono">{cat.total.toLocaleString()} reviews</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-cyan-300 font-bold">Score: {cat.averageScore.toFixed(2)}</span>
                </div>
              </div>

              {/* Radiant Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden flex p-[1px] border border-white/5">
                <div
                  style={{ width: `${posPct}%` }}
                  className="bg-emerald-400 h-full rounded-l-full transition-all duration-300 shadow-[0_0_8px_#34d399]"
                  title={`Positive: ${cat.positive} (${posPct.toFixed(0)}%)`}
                />
                <div
                  style={{ width: `${neuPct}%` }}
                  className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
                  title={`Neutral: ${cat.neutral} (${neuPct.toFixed(0)}%)`}
                />
                <div
                  style={{ width: `${negPct}%` }}
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-300 shadow-[0_0_8px_#fb7185]"
                  title={`Negative: ${cat.negative} (${negPct.toFixed(0)}%)`}
                />
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium">{cat.positive} Pos ({posPct.toFixed(0)}%)</span>
                <span className="text-cyan-300 font-medium">{cat.neutral} Neu ({neuPct.toFixed(0)}%)</span>
                <span className="text-rose-400 font-medium">{cat.negative} Neg ({negPct.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
        <span>Click any entity card to filter review records</span>
        <span className="font-semibold text-violet-300">{categories.length} entities recognized</span>
      </div>
    </div>
  );
};
