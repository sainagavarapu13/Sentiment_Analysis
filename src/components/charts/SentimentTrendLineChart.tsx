import React, { useState } from 'react';
import { MonthlyTrend } from '../../types/sentiment';
import { TrendingUp, LineChart } from 'lucide-react';

interface SentimentTrendLineChartProps {
  data: MonthlyTrend[];
}

export const SentimentTrendLineChart: React.FC<SentimentTrendLineChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Sentiment Trends Over Time</h3>
            <p className="text-xs text-slate-400">Chronological trajectory across dataset records</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
            0 Intervals
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <LineChart className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200 max-w-xs">
            Sentiment trends will appear after analysis.
          </p>
          <span className="text-xs text-slate-400 mt-1.5 max-w-[240px]">
            No temporal data available until dates or timestamps are parsed
          </span>
        </div>

        <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 text-center">
          No chronological records detected
        </div>
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.positive, d.neutral, d.negative, 1)));

  const getX = (index: number) => {
    if (data.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - (val / maxVal) * chartHeight;
  };

  // SVG paths
  const positivePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.positive)}`)
    .join(' ');

  const neutralPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.neutral)}`)
    .join(' ');

  const negativePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.negative)}`)
    .join(' ');

  const positiveAreaPath = data.length > 1
    ? `${positivePath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
    : '';

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">Sentiment Trends Over Time</h3>
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                <TrendingUp className="w-3 h-3" />
                Temporal Flow
              </span>
            </div>
            <p className="text-xs text-slate-400">Chronological trajectory across dataset records</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950/60 border border-white/5 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded-lg transition duration-200 cursor-pointer ${
                activeMetric === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveMetric('positive')}
              className={`px-2.5 py-1 rounded-lg transition duration-200 cursor-pointer ${
                activeMetric === 'positive'
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setActiveMetric('negative')}
              className={`px-2.5 py-1 rounded-lg transition duration-200 cursor-pointer ${
                activeMetric === 'negative'
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Negative
            </button>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto drop-shadow-md"
            style={{ minHeight: '210px' }}
          >
            <defs>
              <linearGradient id="radPosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const tickVal = Math.round(maxVal * pct);
              const y = getY(tickVal);
              return (
                <g key={pct}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {tickVal}
                  </text>
                </g>
              );
            })}

            {/* Glowing trend area */}
            {(activeMetric === 'all' || activeMetric === 'positive') && positiveAreaPath && (
              <path d={positiveAreaPath} fill="url(#radPosGradient)" />
            )}

            {/* Neutral curve */}
            {(activeMetric === 'all' || activeMetric === 'neutral') && (
              <path
                d={neutralPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
                className="drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
              />
            )}

            {/* Negative curve */}
            {(activeMetric === 'all' || activeMetric === 'negative') && (
              <path
                d={negativePath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              />
            )}

            {/* Positive curve */}
            {(activeMetric === 'all' || activeMetric === 'positive') && (
              <path
                d={positivePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            )}

            {/* Vertical hover line */}
            {hoveredIndex !== null && (
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartHeight}
                stroke="rgba(167, 139, 250, 0.6)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Points & month text */}
            {data.map((d, i) => {
              const x = getX(i);
              const yPos = getY(d.positive);
              const isHovered = hoveredIndex === i;

              return (
                <g key={d.month + i}>
                  {(activeMetric === 'all' || activeMetric === 'positive') && (
                    <circle
                      cx={x}
                      cy={yPos}
                      r={isHovered ? 6 : 4}
                      fill="#060913"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_6px_#10b981]"
                    />
                  )}

                  {(activeMetric === 'all' || activeMetric === 'negative') && (
                    <circle
                      cx={x}
                      cy={getY(d.negative)}
                      r={isHovered ? 5 : 3.5}
                      fill="#060913"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      className="drop-shadow-[0_0_6px_#f43f5e]"
                    />
                  )}

                  <text
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`text-[11px] select-none font-medium ${
                      isHovered ? 'fill-cyan-300 font-bold' : 'fill-slate-400'
                    }`}
                  >
                    {d.month}
                  </text>

                  <rect
                    x={x - chartWidth / (Math.max(data.length, 1) * 2)}
                    y={padding.top}
                    width={chartWidth / Math.max(data.length, 1)}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {hoveredIndex !== null ? (
          <div className="w-full flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-violet-500/20 shadow-xs">
            <span className="font-bold text-white">{data[hoveredIndex].month}</span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-semibold font-mono">Positive: {data[hoveredIndex].positive}</span>
              <span className="text-cyan-400 font-medium font-mono">Neutral: {data[hoveredIndex].neutral}</span>
              <span className="text-rose-400 font-semibold font-mono">Negative: {data[hoveredIndex].negative}</span>
              <span className="text-violet-300 font-bold font-mono">Avg: {data[hoveredIndex].averageScore.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" />
                <span className="text-slate-300">Positive Trend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-rose-400 rounded-full shadow-[0_0_6px_#fb7185]" />
                <span className="text-slate-300">Negative Trend</span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{data.length} Time Intervals</span>
          </div>
        )}
      </div>
    </div>
  );
};
