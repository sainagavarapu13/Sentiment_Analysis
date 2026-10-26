import React, { useState } from 'react';
import { KeywordMetric } from '../../types/sentiment';
import { ThumbsUp, ThumbsDown, Hash, Cloud } from 'lucide-react';

interface WordCloudSectionProps {
  keywords: KeywordMetric[];
  onWordClick?: (word: string) => void;
  activeFilterWord?: string;
}

export const WordCloudSection: React.FC<WordCloudSectionProps> = ({
  keywords,
  onWordClick,
  activeFilterWord,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  if (!keywords || keywords.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Keyword Frequency & Word Cloud</h3>
            <p className="text-xs text-slate-400">
              Positive and negative keywords extracted from analyzed text
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
            0 Keywords
          </span>
        </div>
        <div className="p-10 text-center rounded-xl bg-slate-950/40 border border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Cloud className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200">No keywords available yet.</p>
          <span className="text-xs text-slate-400 mt-1 block">
            Extracted terms and token frequencies will appear after dataset analysis
          </span>
        </div>
      </div>
    );
  }

  const filteredKeywords = keywords.filter((k) => {
    if (filterType === 'positive') return k.type === 'positive';
    if (filterType === 'negative') return k.type === 'negative';
    return true;
  });

  const positiveKeywords = keywords.filter((k) => k.type === 'positive');
  const negativeKeywords = keywords.filter((k) => k.type === 'negative');

  const maxCount = Math.max(...keywords.map((k) => k.count), 1);
  const minCount = Math.min(...keywords.map((k) => k.count), 1);

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 18;
    const scale = (count - minCount) / (maxCount - minCount);
    return Math.round(13 + scale * 20);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base tracking-tight">Keyword Frequency & Word Cloud</h3>
            <span className="text-[11px] font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              NLP Extracted ({keywords.length})
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Frequently occurring positive and negative opinion words extracted from active dataset
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 border border-white/5 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Keywords
          </button>
          <button
            onClick={() => setFilterType('positive')}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
              filterType === 'positive'
                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilterType('negative')}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
              filterType === 'negative'
                ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Floating Word Cloud Canvas */}
        <div className="lg:col-span-7 bg-slate-950/50 rounded-2xl p-6 border border-white/5 min-h-[240px] flex flex-wrap items-center justify-center gap-3 sm:gap-4 content-center shadow-inner">
          {filteredKeywords.map((item) => {
            const fontSize = getFontSize(item.count);
            const isSelected = activeFilterWord?.toLowerCase() === item.word.toLowerCase();
            const isPos = item.type === 'positive';

            return (
              <button
                key={item.word}
                onClick={() => onWordClick && onWordClick(item.word)}
                style={{ fontSize: `${fontSize}px` }}
                className={`font-extrabold transition-all duration-200 transform hover:scale-110 px-2.5 py-1 rounded-lg flex items-baseline gap-1.5 select-none cursor-pointer ${
                  isSelected
                    ? isPos
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-[0_0_15px_#34d399]'
                      : 'bg-rose-500 text-white ring-2 ring-rose-300 shadow-[0_0_15px_#fb7185]'
                    : isPos
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                }`}
                title={`Click to filter reviews for "${item.word}" (${item.count.toLocaleString()} occurrences)`}
              >
                <span>{item.word}</span>
                <span className="text-[10px] opacity-75 font-normal font-mono">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Top Positives & Negatives List */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/15">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Positive Keywords</span>
            </div>
            <ol className="space-y-2 text-xs">
              {positiveKeywords.slice(0, 5).map((item, idx) => (
                <li
                  key={item.word}
                  onClick={() => onWordClick && onWordClick(item.word)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    activeFilterWord?.toLowerCase() === item.word.toLowerCase()
                      ? 'bg-emerald-500/20 text-white font-bold'
                      : 'hover:bg-emerald-500/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-emerald-400 font-mono text-[11px]">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-slate-200">{item.word}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {item.count.toLocaleString()}
                  </span>
                </li>
              ))}
              {positiveKeywords.length === 0 && (
                <li className="text-slate-500 text-xs italic">No positive keywords</li>
              )}
            </ol>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/15">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
              <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Negative Keywords</span>
            </div>
            <ol className="space-y-2 text-xs">
              {negativeKeywords.slice(0, 5).map((item, idx) => (
                <li
                  key={item.word}
                  onClick={() => onWordClick && onWordClick(item.word)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    activeFilterWord?.toLowerCase() === item.word.toLowerCase()
                      ? 'bg-rose-500/20 text-white font-bold'
                      : 'hover:bg-rose-500/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-rose-400 font-mono text-[11px]">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-slate-200">{item.word}</span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 font-bold">
                    {item.count.toLocaleString()}
                  </span>
                </li>
              ))}
              {negativeKeywords.length === 0 && (
                <li className="text-slate-500 text-xs italic">No negative keywords</li>
              )}
            </ol>
          </div>
        </div>
      </div>

      {activeFilterWord && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-medium">
            <Hash className="w-3.5 h-3.5" />
            <span>Filtering reviews mentioning: <strong className="text-white">"{activeFilterWord}"</strong></span>
          </div>
          <button
            onClick={() => onWordClick && onWordClick('')}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Clear keyword filter
          </button>
        </div>
      )}
    </div>
  );
};
