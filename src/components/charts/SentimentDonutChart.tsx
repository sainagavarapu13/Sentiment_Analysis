import React, { useState } from 'react';
import { SentimentMetric } from '../../types/sentiment';
import { PieChart, Sparkles } from 'lucide-react';

interface SentimentDonutChartProps {
  metrics: SentimentMetric | null;
  onSelectCategory?: (sentiment: 'positive' | 'neutral' | 'negative' | 'all') => void;
}

export const SentimentDonutChart: React.FC<SentimentDonutChartProps> = ({
  metrics,
  onSelectCategory,
}) => {
  const [activeSegment, setActiveSegment] = useState<'positive' | 'neutral' | 'negative' | null>(null);

  const hasData = metrics !== null && metrics.totalReviews > 0;

  if (!hasData) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Sentiment Distribution</h3>
            <p className="text-xs text-slate-400">Positive · Neutral · Negative Breakdown</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
            0 Records
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-30" />
            <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <PieChart className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-200 max-w-xs">
            Upload and analyze a dataset to view sentiment distribution.
          </p>
          <span className="text-xs text-slate-400 mt-1.5 max-w-[220px]">
            Real distribution percentages & donut arcs appear dynamically
          </span>
        </div>

        <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 text-center">
          Awaiting dataset analysis
        </div>
      </div>
    );
  }

  const radius = 80;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  const pPos = metrics.positivePercentage;
  const pNeu = metrics.neutralPercentage;
  const pNeg = metrics.negativePercentage;

  const posOffset = 0;
  const neuOffset = (pPos / 100) * circumference;
  const negOffset = ((pPos + pNeu) / 100) * circumference;

  const posStroke = (pPos / 100) * circumference;
  const neuStroke = (pNeu / 100) * circumference;
  const negStroke = (pNeg / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden">
      {/* Radiant glow accent */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Sentiment Distribution</h3>
            <p className="text-xs text-slate-400">Class Proportion · Radiant Donut</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            {metrics.totalReviews.toLocaleString()} Total
          </span>
        </div>

        {/* Donut SVG with neon filter drop-shadows */}
        <div className="relative flex items-center justify-center py-4">
          <svg
            className="w-56 h-56 transform -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            viewBox="0 0 200 200"
            aria-label="Sentiment distribution donut chart"
          >
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#0f172a"
              strokeWidth={strokeWidth}
            />

            {/* Positive Segment */}
            {pPos > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={activeSegment === 'positive' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${posStroke} ${circumference}`}
                strokeDashoffset={-posOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300 hover:opacity-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                onMouseEnter={() => setActiveSegment('positive')}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => onSelectCategory && onSelectCategory('positive')}
              />
            )}

            {/* Neutral Segment */}
            {pNeu > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth={activeSegment === 'neutral' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${neuStroke} ${circumference}`}
                strokeDashoffset={-neuOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300 hover:opacity-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                onMouseEnter={() => setActiveSegment('neutral')}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => onSelectCategory && onSelectCategory('neutral')}
              />
            )}

            {/* Negative Segment */}
            {pNeg > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth={activeSegment === 'negative' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${negStroke} ${circumference}`}
                strokeDashoffset={-negOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300 hover:opacity-90 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                onMouseEnter={() => setActiveSegment('negative')}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => onSelectCategory && onSelectCategory('negative')}
              />
            )}
          </svg>

          {/* Central label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSegment === 'positive' && (
              <>
                <span className="text-3xl font-black text-emerald-400 font-mono">{metrics.positivePercentage}%</span>
                <span className="text-xs font-semibold text-slate-200">Positive</span>
                <span className="text-[10px] text-slate-400 font-mono">{metrics.positiveReviews.toLocaleString()} reviews</span>
              </>
            )}
            {activeSegment === 'neutral' && (
              <>
                <span className="text-3xl font-black text-cyan-400 font-mono">{metrics.neutralPercentage}%</span>
                <span className="text-xs font-semibold text-slate-200">Neutral</span>
                <span className="text-[10px] text-slate-400 font-mono">{metrics.neutralReviews.toLocaleString()} reviews</span>
              </>
            )}
            {activeSegment === 'negative' && (
              <>
                <span className="text-3xl font-black text-rose-400 font-mono">{metrics.negativePercentage}%</span>
                <span className="text-xs font-semibold text-slate-200">Negative</span>
                <span className="text-[10px] text-slate-400 font-mono">{metrics.negativeReviews.toLocaleString()} reviews</span>
              </>
            )}
            {!activeSegment && (
              <>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Polarity</span>
                <span className="text-3xl font-black text-white tracking-tight font-mono">{metrics.averageSentimentScore.toFixed(2)}</span>
                <span className="text-xs font-semibold text-cyan-400 capitalize">{metrics.overallSentiment} Class</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Legend with Glass Pills */}
      <div className="space-y-2 mt-4 pt-3 border-t border-white/5">
        <div
          onClick={() => onSelectCategory && onSelectCategory('positive')}
          onMouseEnter={() => setActiveSegment('positive')}
          onMouseLeave={() => setActiveSegment(null)}
          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
            activeSegment === 'positive' ? 'bg-emerald-500/15 border border-emerald-500/30' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-medium text-slate-200">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono">{metrics.positiveReviews.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {metrics.positivePercentage}%
            </span>
          </div>
        </div>

        <div
          onClick={() => onSelectCategory && onSelectCategory('neutral')}
          onMouseEnter={() => setActiveSegment('neutral')}
          onMouseLeave={() => setActiveSegment(null)}
          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
            activeSegment === 'neutral' ? 'bg-cyan-500/15 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="text-xs font-medium text-slate-200">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono">{metrics.neutralReviews.toLocaleString()}</span>
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
              {metrics.neutralPercentage}%
            </span>
          </div>
        </div>

        <div
          onClick={() => onSelectCategory && onSelectCategory('negative')}
          onMouseEnter={() => setActiveSegment('negative')}
          onMouseLeave={() => setActiveSegment(null)}
          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
            activeSegment === 'negative' ? 'bg-rose-500/15 border border-rose-500/30' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
            <span className="text-xs font-medium text-slate-200">Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono">{metrics.negativeReviews.toLocaleString()}</span>
            <span className="text-xs font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
              {metrics.negativePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
