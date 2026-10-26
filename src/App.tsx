/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { SentimentDonutChart } from './components/charts/SentimentDonutChart';
import { SentimentTrendLineChart } from './components/charts/SentimentTrendLineChart';
import { CategoryBarChart } from './components/charts/CategoryBarChart';
import { WordCloudSection } from './components/charts/WordCloudSection';
import { ReviewTable } from './components/ReviewTable';
import { LiveReviewTester } from './components/LiveReviewTester';
import { UploadDatasetView } from './components/UploadDatasetView';
import { ReviewItem, SentimentMetric, SentimentType, MonthlyTrend, CategoryMetric, KeywordMetric } from './types/sentiment';
import { ParsedDatasetResult, calculateDatasetAnalytics } from './utils/fileParser';
import { Sparkles, UploadCloud, RotateCcw, Layers, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'tester' | 'reviews'>('dashboard');

  // CRITICAL REQUIREMENT: Complete empty initial state. Zero mock/sample/hardcoded values.
  const [datasetName, setDatasetName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SentimentMetric | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetric[]>([]);
  const [keywordMetrics, setKeywordMetrics] = useState<KeywordMetric[]>([]);

  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [activeKeywordFilter, setActiveKeywordFilter] = useState<string>('');
  const [testerInitialText, setTesterInitialText] = useState<string>('');

  const hasData = metrics !== null && reviews.length > 0;

  // Handle analyzed dataset
  const handleDatasetAnalyzed = (data: ParsedDatasetResult) => {
    setDatasetName(data.datasetName);
    setReviews(data.reviews);
    setMetrics(data.metrics);
    setMonthlyTrends(data.monthlyTrends);
    setCategoryMetrics(data.categoryMetrics);
    setKeywordMetrics(data.keywordMetrics);
    setSentimentFilter('all');
    setActiveKeywordFilter('');
    setActiveTab('dashboard');
  };

  // Reset analysis
  const handleResetAnalysis = () => {
    setDatasetName(null);
    setMetrics(null);
    setReviews([]);
    setMonthlyTrends([]);
    setCategoryMetrics([]);
    setKeywordMetrics([]);
    setSentimentFilter('all');
    setActiveKeywordFilter('');
    setActiveTab('dashboard');
  };

  const handleSentimentFilter = (sentiment: SentimentType | 'all') => {
    setSentimentFilter(sentiment);
    const tableEl = document.getElementById('review-table-section');
    if (tableEl && activeTab === 'dashboard') {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryFilter = (category: string) => {
    setActiveKeywordFilter(category);
    const tableEl = document.getElementById('review-table-section');
    if (tableEl && activeTab === 'dashboard') {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeywordClick = (word: string) => {
    setActiveKeywordFilter(word);
    const tableEl = document.getElementById('review-table-section');
    if (tableEl && activeTab === 'dashboard') {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInspectReview = (text: string) => {
    setTesterInitialText(text);
    setActiveTab('tester');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddReviewToDataset = (
    text: string,
    sentiment: SentimentType,
    score: number,
    keywords: string[],
    product: string
  ) => {
    const newReview: ReviewItem = {
      id: `REV-${reviews.length + 1001}`,
      source: 'Customer Feedback',
      target: product || 'General',
      author: 'Live User Session',
      date: new Date().toISOString().split('T')[0],
      rating: sentiment === 'positive' ? 5 : sentiment === 'negative' ? 1 : 3,
      text,
      sentiment,
      score,
      confidence: 0.96,
      matchedKeywords: keywords,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    const activeName = datasetName || 'Live Session Dataset';
    setDatasetName(activeName);

    const updatedAnalytics = calculateDatasetAnalytics(updatedReviews, activeName);
    setMetrics(updatedAnalytics.metrics);
    setMonthlyTrends(updatedAnalytics.monthlyTrends);
    setCategoryMetrics(updatedAnalytics.categoryMetrics);
    setKeywordMetrics(updatedAnalytics.keywordMetrics);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-cyan-200">
      {/* Background Radiant Atmosphere: Subtle Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] animate-ambient" />
        <div className="absolute top-[30%] right-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-cyan-500/12 via-blue-600/10 to-transparent blur-[130px] animate-ambient" style={{ animationDelay: '-4s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-violet-700/12 via-fuchsia-600/8 to-transparent blur-[140px]" />
        {/* Subtle dot mesh pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Floating Top Navigation */}
      <div className="relative z-30 pt-3">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          datasetName={datasetName}
          totalReviews={reviews.length}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-10 space-y-6">
        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Context / Welcome Banner */}
            {!hasData ? (
              <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center flex flex-col items-center justify-center border-violet-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(99,102,241,0.12)]">
                {/* Radiant orb behind center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                  {/* Floating AI badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Radiant Sentiment Intelligence Engine</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Ready to Analyze
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-lg leading-relaxed">
                    Upload your dataset to generate real-time sentiment insights, polarity distributions, and keyword telemetry.
                  </p>

                  {/* Large Glowing Upload Button */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-2xl text-sm font-bold shadow-[0_0_30px_rgba(99,102,241,0.45)] flex items-center justify-center gap-2.5 transition duration-200 cursor-pointer transform hover:scale-[1.02]"
                    >
                      <UploadCloud className="w-5 h-5 text-white" />
                      <span>Upload Dataset</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>

                    <button
                      onClick={() => setActiveTab('tester')}
                      className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-2xl text-sm font-semibold transition border border-white/10 hover:border-violet-400/30 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>Test Single Review</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 mt-4 font-mono font-medium">
                    CSV / XLSX supported
                  </span>
                </div>
              </div>
            ) : (
              /* Active Dataset Toolbar */
              <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-cyan-500/20 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                        {datasetName}
                      </h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        {reviews.length.toLocaleString()} Analyzed Records
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Telemetry generated strictly from active uploaded dataset
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition duration-200 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload New Dataset</span>
                  </button>

                  <button
                    onClick={handleResetAnalysis}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 rounded-xl border border-rose-500/30 transition duration-200 cursor-pointer shadow-xs"
                    title="Clear current dataset and return to empty dashboard"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset Analysis</span>
                  </button>
                </div>
              </div>
            )}

            {/* Metric KPI Cards (Shows — when empty) */}
            <KPICards metrics={metrics} onFilterClick={handleSentimentFilter} />

            {/* Visualizations Row 1: Donut Chart & Monthly Trend Line Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4">
                <SentimentDonutChart
                  metrics={metrics}
                  onSelectCategory={handleSentimentFilter}
                />
              </div>
              <div className="lg:col-span-8">
                <SentimentTrendLineChart data={monthlyTrends} />
              </div>
            </div>

            {/* Visualizations Row 2: Top Reviewed Products / Categories Bar Chart */}
            <div>
              <CategoryBarChart
                categories={categoryMetrics}
                onSelectCategory={handleCategoryFilter}
              />
            </div>

            {/* Visualizations Row 3: Keyword Analysis & Word Cloud */}
            <div>
              <WordCloudSection
                keywords={keywordMetrics}
                onWordClick={handleKeywordClick}
                activeFilterWord={activeKeywordFilter}
              />
            </div>

            {/* Visualizations Row 4: Individual Review Table */}
            <div id="review-table-section">
              <ReviewTable
                reviews={reviews}
                activeSentimentFilter={sentimentFilter}
                onSentimentFilterChange={setSentimentFilter}
                activeKeywordFilter={activeKeywordFilter}
                onClearKeywordFilter={() => setActiveKeywordFilter('')}
                onSelectReviewForAnalysis={handleInspectReview}
              />
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD DATA (CSV, XLSX, XLS, JSON, PDF) */}
        {activeTab === 'upload' && (
          <UploadDatasetView
            onDatasetAnalyzed={handleDatasetAnalyzed}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {/* TAB 3: LIVE REVIEW / TEST */}
        {activeTab === 'tester' && (
          <LiveReviewTester
            initialText={testerInitialText}
            onAddReviewToDataset={handleAddReviewToDataset}
          />
        )}

        {/* TAB 4: REVIEWS CORPUS TABLE */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {datasetName ? `${datasetName} — Review Records` : 'Review Classification Records'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {reviews.length > 0
                    ? `${reviews.length.toLocaleString()} analyzed records with predicted sentiment, polarity scores, and keyword triggers`
                    : 'No reviews analyzed yet'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Dataset</span>
                </button>
              </div>
            </div>

            <ReviewTable
              reviews={reviews}
              activeSentimentFilter={sentimentFilter}
              onSentimentFilterChange={setSentimentFilter}
              activeKeywordFilter={activeKeywordFilter}
              onClearKeywordFilter={() => setActiveKeywordFilter('')}
              onSelectReviewForAnalysis={handleInspectReview}
            />
          </div>
        )}
      </main>

      {/* Floating Glass Footer */}
      <footer className="mt-14 border-t border-white/5 bg-slate-950/70 backdrop-blur-md py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">Sentiment Analysis</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Radiant NLP Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Total Reviews: <strong className="text-white font-mono">{reviews.length > 0 ? reviews.length.toLocaleString() : '—'}</strong></span>
            <span>·</span>
            <span>Positive: <strong className="text-emerald-400 font-mono">{metrics ? `${metrics.positivePercentage}%` : '—'}</strong></span>
            <span>·</span>
            <span>Score: <strong className="text-cyan-300 font-mono">{metrics ? metrics.averageSentimentScore.toFixed(2) : '—'}</strong></span>
            <span>·</span>
            <span>Top Entity: <strong className="text-violet-300">{metrics && metrics.topReviewedProduct !== 'None' ? metrics.topReviewedProduct : '—'}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
