import React from 'react';
import { Activity, BarChart3, Database, Sparkles } from 'lucide-react';
import { AuthButton } from './AuthButton';

interface NavbarProps {
  activeTab: 'dashboard' | 'upload' | 'tester' | 'reviews';
  setActiveTab: (tab: 'dashboard' | 'upload' | 'tester' | 'reviews') => void;
  datasetName: string | null;
  totalReviews: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetName,
  totalReviews,
}) => {
  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="relative rounded-2xl p-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)]">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Brand Logo & Title with Radiant Indicator */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950/80 rounded-[11px] flex items-center justify-center backdrop-blur-xs">
                <Activity className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Sentiment Analysis
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  totalReviews > 0
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                }`}>
                  {totalReviews > 0 ? 'Live Model' : 'NLP Engine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[200px] lg:max-w-none">
                {datasetName ? (
                  <>
                    Active Corpus: <span className="text-violet-300 font-semibold">{datasetName}</span>
                    <span className="text-slate-500 ml-1.5 font-mono">({totalReviews.toLocaleString()} rows)</span>
                  </>
                ) : (
                  <span className="text-slate-400">Ready for dataset ingestion</span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation Links: Floating Pills */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/40 border border-white/5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('tester')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'tester'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Live Review / Test</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Reviews ({totalReviews})</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Firebase Authentication */}
            <AuthButton />
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 px-3 gap-1 border-t border-white/5 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'tester' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Review / Test
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reviews ({totalReviews})
          </button>
        </div>
      </div>
    </header>
  );
};
