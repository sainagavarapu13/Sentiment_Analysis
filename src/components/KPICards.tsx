import React from 'react';
import { SentimentMetric } from '../types/sentiment';
import { CheckCircle2, MinusCircle, XCircle, TrendingUp, Award, Layers, Sparkles } from 'lucide-react';

interface KPICardsProps {
  metrics: SentimentMetric | null;
  onFilterClick?: (filter: 'all' | 'positive' | 'neutral' | 'negative') => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, onFilterClick }) => {
  const hasData = metrics !== null && metrics.totalReviews > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Reviews Card */}
      <div 
        onClick={() => hasData && onFilterClick && onFilterClick('all')}
        className={`glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group ${
          hasData ? 'cursor-pointer' : 'opacity-90'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-300" />
        
        <div className="flex items-center justify-between text-slate-400 mb-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reviews</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight relative z-10">
          {hasData ? metrics.totalReviews.toLocaleString() : '—'}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 relative z-10">
          <span className="text-slate-400">{hasData ? 'Active Dataset' : 'No dataset loaded'}</span>
          <span className="font-semibold text-indigo-300">{hasData ? '100% processed' : '—'}</span>
        </div>
      </div>

      {/* 2. Positive Reviews Card */}
      <div 
        onClick={() => hasData && onFilterClick && onFilterClick('positive')}
        className={`glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group ${
          hasData ? 'cursor-pointer hover:border-emerald-500/40 hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.2)]' : 'opacity-90'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />

        <div className="flex items-center justify-between text-slate-400 mb-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Positive Reviews</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2.5 relative z-10">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {hasData ? metrics.positiveReviews.toLocaleString() : '—'}
          </span>
          {hasData && (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              {metrics.positivePercentage}%
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 relative z-10">
          <span className="text-slate-400">{hasData ? 'Favorable sentiment' : 'Awaiting analysis'}</span>
          <span className="text-emerald-400 font-semibold">
            {hasData ? `${metrics.positivePercentage}%` : '—'}
          </span>
        </div>
      </div>

      {/* 3. Neutral Reviews Card */}
      <div 
        onClick={() => hasData && onFilterClick && onFilterClick('neutral')}
        className={`glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group ${
          hasData ? 'cursor-pointer hover:border-amber-500/40 hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.2)]' : 'opacity-90'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-300" />

        <div className="flex items-center justify-between text-slate-400 mb-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Neutral Reviews</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <MinusCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2.5 relative z-10">
          <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
            {hasData ? metrics.neutralReviews.toLocaleString() : '—'}
          </span>
          {hasData && (
            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              {metrics.neutralPercentage}%
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 relative z-10">
          <span className="text-slate-400">{hasData ? 'Balanced / Factual' : 'Awaiting analysis'}</span>
          <span className="text-amber-400 font-semibold">
            {hasData ? `${metrics.neutralPercentage}%` : '—'}
          </span>
        </div>
      </div>

      {/* 4. Negative Reviews Card */}
      <div 
        onClick={() => hasData && onFilterClick && onFilterClick('negative')}
        className={`glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group ${
          hasData ? 'cursor-pointer hover:border-rose-500/40 hover:shadow-[0_15px_35px_-10px_rgba(244,63,94,0.2)]' : 'opacity-90'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-300" />

        <div className="flex items-center justify-between text-slate-400 mb-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Negative Reviews</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2.5 relative z-10">
          <span className="text-3xl font-extrabold text-rose-400 tracking-tight">
            {hasData ? metrics.negativeReviews.toLocaleString() : '—'}
          </span>
          {hasData && (
            <span className="text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.2)]">
              {metrics.negativePercentage}%
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 relative z-10">
          <span className="text-slate-400">{hasData ? 'Critical feedback' : 'Awaiting analysis'}</span>
          <span className="text-rose-400 font-semibold">
            {hasData ? `${metrics.negativePercentage}%` : '—'}
          </span>
        </div>
      </div>

      {/* Secondary Banner Cards with Radiant Background Gradients */}
      <div className="sm:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-violet-500/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7),0_0_30px_rgba(139,92,246,0.12)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Average Sentiment</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5 capitalize flex items-center gap-2.5">
              {hasData ? (
                <>
                  <span className="bg-gradient-to-r from-white via-slate-100 to-violet-200 bg-clip-text text-transparent">
                    {metrics.overallSentiment} Customer Sentiment
                  </span>
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    metrics.overallSentiment === 'positive'
                      ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                      : metrics.overallSentiment === 'negative'
                      ? 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
                      : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                  } animate-pulse`} />
                </>
              ) : (
                <span className="text-slate-500 font-normal text-lg">—</span>
              )}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Polarity Index</div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight font-mono">
              {hasData ? (
                <>
                  {metrics.averageSentimentScore.toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ 1.00</span>
                </>
              ) : (
                <span className="text-slate-600 font-normal">—</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>{hasData ? 'Aggregated normalized score across reviews' : 'Upload dataset to compute score'}</span>
          </div>
          <span className="text-cyan-300 font-semibold font-mono">
            {hasData ? `${metrics.positivePercentage}% Favorability` : '—'}
          </span>
        </div>
      </div>

      <div className="sm:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-cyan-500/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7),0_0_30px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Reviewed Entity</span>
            </div>
            <div className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              <span className="truncate max-w-[220px] bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                {hasData && metrics.topReviewedProduct !== 'None' ? metrics.topReviewedProduct : '—'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {hasData ? 'Highest review volume across active dataset' : 'Identified automatically from dataset'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Volume</div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {hasData && metrics.topProductReviewCount > 0 ? metrics.topProductReviewCount.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-cyan-300 font-mono font-medium">
              {hasData && metrics.topProductReviewCount > 0 ? `Avg Score: ${metrics.topProductSentimentScore.toFixed(2)}` : '—'}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>Target Distribution</span>
          <span className="font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            {hasData && metrics.topProductReviewCount > 0 ? `${metrics.topProductReviewCount} mentions logged` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
