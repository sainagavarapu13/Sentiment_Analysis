import React, { useState, useMemo } from 'react';
import { ReviewItem, SentimentType } from '../types/sentiment';
import { Search, Download, Star, CheckCircle, AlertCircle, HelpCircle, ArrowUpDown, Sparkles } from 'lucide-react';
import { InspectNLPModal } from './InspectNLPModal';

interface ReviewTableProps {
  reviews: ReviewItem[];
  activeSentimentFilter?: SentimentType | 'all';
  onSentimentFilterChange?: (filter: SentimentType | 'all') => void;
  activeKeywordFilter?: string;
  onClearKeywordFilter?: () => void;
  onSelectReviewForAnalysis?: (text: string) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  reviews,
  activeSentimentFilter = 'all',
  onSentimentFilterChange,
  activeKeywordFilter = '',
  onClearKeywordFilter,
  onSelectReviewForAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'score' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected review for inspect modal
  const [inspectReview, setInspectReview] = useState<ReviewItem | null>(null);

  // Filter logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      if (activeSentimentFilter !== 'all' && item.sentiment !== activeSentimentFilter) {
        return false;
      }
      if (selectedSource !== 'all' && item.source !== selectedSource) {
        return false;
      }
      if (activeKeywordFilter && !item.text.toLowerCase().includes(activeKeywordFilter.toLowerCase())) {
        return false;
      }
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const inText = item.text.toLowerCase().includes(query);
        const inTarget = item.target.toLowerCase().includes(query);
        const inAuthor = item.author.toLowerCase().includes(query);
        const inId = item.id.toLowerCase().includes(query);
        return inText || inTarget || inAuthor || inId;
      }
      return true;
    });
  }, [reviews, activeSentimentFilter, selectedSource, activeKeywordFilter, searchTerm]);

  // Sort logic
  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort((a, b) => {
      if (sortField === 'score') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }
      if (sortField === 'rating') {
        return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      }
      return sortOrder === 'desc'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredReviews, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage) || 1;
  const currentReviews = sortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'date' | 'score' | 'rating') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Source', 'Target', 'Author', 'Date', 'Rating', 'Sentiment', 'Score', 'Confidence', 'Text'];
    const rows = sortedReviews.map((r) => [
      r.id,
      r.source,
      `"${r.target}"`,
      `"${r.author}"`,
      r.date,
      r.rating,
      r.sentiment,
      r.score,
      r.confidence,
      `"${r.text.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentiment_analysis_reviews_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHighlightedText = (text: string, matchedKeywords: string[]) => {
    if (!matchedKeywords || matchedKeywords.length === 0) return text;
    const regex = new RegExp(`\\b(${matchedKeywords.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isKeyword = matchedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return (
          <span key={index} className="bg-amber-400/20 text-amber-300 font-bold px-1 rounded-sm border border-amber-400/30">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden relative">
      {/* Header & Controls */}
      <div className="p-5 border-b border-white/5 bg-slate-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">Review Classification Table</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                {filteredReviews.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated reviews with predicted sentiment, confidence scores, and keyword extraction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={reviews.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-xl border border-white/10 shadow-xs transition duration-200 cursor-pointer"
              title="Download dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by review text, entity, or author..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900/60 text-white placeholder-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sentiment Segmented Control */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs font-medium">
              <button
                onClick={() => {
                  onSentimentFilterChange && onSentimentFilterChange('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
                  activeSentimentFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  onSentimentFilterChange && onSentimentFilterChange('positive');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
                  activeSentimentFilter === 'positive'
                    ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => {
                  onSentimentFilterChange && onSentimentFilterChange('neutral');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
                  activeSentimentFilter === 'neutral'
                    ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Neutral
              </button>
              <button
                onClick={() => {
                  onSentimentFilterChange && onSentimentFilterChange('negative');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${
                  activeSentimentFilter === 'negative'
                    ? 'bg-rose-600 text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Negative
              </button>
            </div>

            {/* Source select */}
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="Product Review">Product Reviews</option>
              <option value="Customer Feedback">Customer Feedback</option>
              <option value="Movie Review">Movie Reviews</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>
        </div>

        {activeKeywordFilter && (
          <div className="mt-3 flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl px-3.5 py-1.5 text-xs text-violet-300">
            <span>
              Filtered by keyword: <strong className="text-white">"{activeKeywordFilter}"</strong>
            </span>
            <button
              onClick={onClearKeywordFilter}
              className="text-cyan-300 hover:text-white font-semibold underline cursor-pointer"
            >
              Reset keyword filter
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Entity & Source</th>
              <th className="py-3 px-4">Review Text</th>
              <th className="py-3 px-4">Predicted Sentiment</th>
              <th
                onClick={() => toggleSort('score')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Polarity</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Deep NLP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {currentReviews.length > 0 ? (
              currentReviews.map((item) => {
                const isPos = item.sentiment === 'positive';
                const isNeg = item.sentiment === 'negative';

                return (
                  <tr key={item.id} className="hover:bg-white/5 transition duration-150">
                    {/* ID & Target */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{item.target}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-violet-300">{item.id}</span>
                        <span>·</span>
                        <span>{item.source}</span>
                      </div>
                    </td>

                    {/* Review text */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-slate-200 leading-relaxed">
                        {renderHighlightedText(item.text, item.matchedKeywords)}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        By {item.author}
                      </div>
                    </td>

                    {/* Predicted sentiment badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPos && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Positive</span>
                        </div>
                      )}
                      {isNeg && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-xs shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Negative</span>
                        </div>
                      )}
                      {!isPos && !isNeg && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Neutral</span>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {(item.confidence * 100).toFixed(0)}% Confidence
                      </div>
                    </td>

                    {/* Polarity Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            item.score > 0
                              ? 'text-emerald-400'
                              : item.score < 0
                              ? 'text-rose-400'
                              : 'text-cyan-300'
                          }`}
                        >
                          {item.score > 0 ? `+${item.score.toFixed(2)}` : item.score.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-16 bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden border border-white/5">
                        <div
                          className={`h-full ${isPos ? 'bg-emerald-400' : isNeg ? 'bg-rose-500' : 'bg-cyan-400'}`}
                          style={{ width: `${Math.round(Math.abs(item.score) * 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {item.date || '—'}
                    </td>

                    {/* Action button: Opens Floating Inspect NLP Modal */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectReview(item)}
                        className="px-3 py-1 rounded-xl text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 shadow-xs transition duration-200 cursor-pointer flex items-center gap-1.5 ml-auto"
                        title="View complete NLP pipeline decomposition"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Inspect NLP</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="font-semibold text-slate-300 text-sm">No reviews available.</p>
                    <p className="text-slate-400 text-xs">Upload and analyze a dataset to populate the review classification table.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({sortedReviews.length} records)
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition cursor-pointer"
          >
            Previous
          </button>
          <span className="px-2 font-mono font-bold text-white">{currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Radiant Floating Modal */}
      {inspectReview && (
        <InspectNLPModal
          isOpen={Boolean(inspectReview)}
          onClose={() => setInspectReview(null)}
          reviewText={inspectReview.text}
          target={inspectReview.target}
          source={inspectReview.source}
          author={inspectReview.author}
          date={inspectReview.date}
        />
      )}
    </div>
  );
};
