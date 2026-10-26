import React, { useEffect, useState } from 'react';
import { runNLPPipeline, runNLPPipelineFromBackend } from '../utils/nlpEngine';
import { NLPPipelineResult } from '../types/sentiment';
import { X, Sparkles, CheckCircle, AlertCircle, HelpCircle, FileText, Sliders, Layers } from 'lucide-react';

interface InspectNLPModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewText: string;
  target?: string;
  source?: string;
  author?: string;
  date?: string;
}

export const InspectNLPModal: React.FC<InspectNLPModalProps> = ({
  isOpen,
  onClose,
  reviewText,
  target,
  source,
  author,
  date,
}) => {
  const [result, setResult] = useState<NLPPipelineResult | null>(null);

  useEffect(() => {
    if (!isOpen || !reviewText) {
      setResult(null);
      return;
    }

    let cancelled = false;

    async function loadResult() {
      const backendResult = await runNLPPipelineFromBackend(reviewText);
      if (!cancelled) {
        setResult(backendResult ?? runNLPPipeline(reviewText));
      }
    }

    loadResult();
    return () => {
      cancelled = true;
    };
  }, [isOpen, reviewText]);

  if (!isOpen || !reviewText) return null;
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-modal rounded-3xl max-w-2xl w-full p-6 sm:p-7 relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-slate-950/80 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">NLP Pipeline Deep Inspection</h3>
              <p className="text-xs text-slate-400">
                {target ? `Entity: ${target}` : 'Text Sequence'} · {source || 'Review Record'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1 relative z-10">
          {/* Classification Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {result.sentiment === 'positive' && (
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shadow-[0_0_10px_#34d399]" />
                  <span>Positive Sentiment</span>
                </div>
              )}
              {result.sentiment === 'neutral' && (
                <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-lg">
                  <HelpCircle className="w-6 h-6 text-cyan-400 shadow-[0_0_10px_#38bdf8]" />
                  <span>Neutral Sentiment</span>
                </div>
              )}
              {result.sentiment === 'negative' && (
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg">
                  <AlertCircle className="w-6 h-6 text-rose-400 shadow-[0_0_10px_#fb7185]" />
                  <span>Negative Sentiment</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Polarity</span>
                <span className="text-sm font-extrabold font-mono text-cyan-300">
                  {result.polarityScore > 0 ? `+${result.polarityScore.toFixed(2)}` : result.polarityScore.toFixed(2)}
                </span>
              </div>
              <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Confidence</span>
                <span className="text-sm font-extrabold font-mono text-violet-300">
                  {(result.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Original Review */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Original Review Text
            </span>
            <p className="text-sm text-slate-100 leading-relaxed font-sans">
              "{reviewText}"
            </p>
            {author && (
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                By {author} {date ? `· ${date}` : ''}
              </div>
            )}
          </div>

          {/* Preprocessed Sanitized Output */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Preprocessed & Cleaned Text (Lowercased & Noise Stripped)
            </span>
            <p className="text-xs font-mono text-cyan-200 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
              "{result.cleanedText}"
            </p>
          </div>

          {/* Extracted Tokens & Stopwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="font-bold text-slate-300 block mb-1.5">
                Retained Content Tokens ({result.tokens.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.tokens.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-950 border border-white/10 text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="font-bold text-slate-300 block mb-1.5">
                Removed Stopwords ({result.removedStopwords.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.removedStopwords.map((sw, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-slate-950/40 text-slate-400 line-through border border-white/5">
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keyword Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-1">
                Positive Keyword Triggers ({result.positiveKeywordsFound.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.positiveKeywordsFound.length > 0 ? (
                  result.positiveKeywordsFound.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-md border border-emerald-500/30">
                      +{kw}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None detected</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <span className="font-bold text-rose-400 block mb-1">
                Negative Keyword Triggers ({result.negativeKeywordsFound.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {result.negativeKeywordsFound.length > 0 ? (
                  result.negativeKeywordsFound.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-semibold rounded-md border border-rose-500/30">
                      -{kw}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end relative z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition cursor-pointer border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
