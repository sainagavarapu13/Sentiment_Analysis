import React, { useEffect, useState } from 'react';
import { runNLPPipeline, runNLPPipelineFromBackend } from '../utils/nlpEngine';
import { NLPPipelineResult, SentimentType } from '../types/sentiment';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sliders,
  RefreshCw,
  PlusCircle,
  Zap,
} from 'lucide-react';

interface LiveReviewTesterProps {
  initialText?: string;
  onAddReviewToDataset?: (text: string, sentiment: SentimentType, score: number, keywords: string[], product: string) => void;
}

export const LiveReviewTester: React.FC<LiveReviewTesterProps> = ({
  initialText = '',
  onAddReviewToDataset,
}) => {
  const [inputText, setInputText] = useState(initialText || '');
  const [targetProduct, setTargetProduct] = useState('');
  const [selectedModel, setSelectedModel] = useState('logistic_regression');
  const [result, setResult] = useState<NLPPipelineResult | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [runRevision, setRunRevision] = useState(0);

  useEffect(() => {
    if (initialText) setInputText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (!inputText.trim()) {
      setResult(null);
      setIsAnalyzing(false);
      return;
    }

    let cancelled = false;
    setIsAnalyzing(true);
    const timeout = window.setTimeout(async () => {
      const backendResult = await runNLPPipelineFromBackend(inputText, selectedModel);
      if (cancelled) return;
      setResult(backendResult ?? runNLPPipeline(inputText));
      setIsAdded(false);
      setIsAnalyzing(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [inputText, selectedModel, runRevision]);

  const handleAdd = () => {
    if (!result || isAdded || !onAddReviewToDataset) return;
    const combinedKeywords = [...result.positiveKeywordsFound, ...result.negativeKeywordsFound];
    onAddReviewToDataset(result.rawText, result.sentiment, result.polarityScore, combinedKeywords, targetProduct || 'Custom Entity');
    setIsAdded(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Interactive Sentiment Tester</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Live Review Sentiment Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Enter a single review, customer feedback comment, or opinion text below.
            The NLP pipeline cleans the text, removes stopwords, scores polarity, and classifies into
            <strong> Positive</strong>, <strong> Neutral</strong>, or <strong> Negative</strong> sentiment in real time.
          </p>
        </div>
      </div>

      {/* Main Tester Form & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Box */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4 relative overflow-hidden">
          <div>
            <label htmlFor="target-product-input" className="font-bold text-slate-300 text-xs uppercase tracking-wider block mb-1.5">
              Associated Product or Entity (Optional)
            </label>
            <input
              id="target-product-input"
              type="text"
              value={targetProduct}
              onChange={(e) => setTargetProduct(e.target.value)}
              placeholder="e.g. Delivery Service, Mobile App, Headphones"
              className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            />

            <label htmlFor="classifier-model" className="font-bold text-slate-300 text-xs uppercase tracking-wider block mb-1.5">
              Classification Model
            </label>
            <select
              id="classifier-model"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            >
              <option value="logistic_regression">Logistic Regression · TF-IDF 1-2 grams</option>
              <option value="svm">Linear SVM · TF-IDF 1-2 grams</option>
              <option value="word2vec">Word2Vec · Logistic Regression</option>
            </select>

            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="review-text-input" className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Enter Review Text
              </label>
              <button
                onClick={() => {
                  setInputText('');
                  setResult(null);
                }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              id="review-text-input"
              rows={5}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                  if (!e.target.value.trim()) {
                  setResult(null);
                }
              }}
              placeholder="Type or paste any single review or comment here to test..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>{inputText.length} characters · {inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
            {result && (
              <span className="font-mono text-cyan-300 font-semibold">
                Analysis: {result.processingTimeMs}ms
              </span>
            )}
            {isAnalyzing && <span className="font-mono text-cyan-300">Analyzing...</span>}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => setRunRevision((revision) => revision + 1)}
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Evaluate Sentiment</span>
            </button>

            {onAddReviewToDataset && result && (
              <button
                onClick={handleAdd}
                disabled={isAdded}
                className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Appended to Active Dataset & Dashboard!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Include this Review into Dashboard Dataset</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Classification Output */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-panel rounded-2xl p-6 space-y-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Predicted Classification Result
                  </span>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    {result.sentiment === 'positive' && (
                      <div className="flex items-center gap-2 text-emerald-400 text-2xl font-bold">
                        <CheckCircle className="w-7 h-7 text-emerald-400 shadow-[0_0_10px_#34d399]" />
                        <span>Positive Sentiment</span>
                      </div>
                    )}
                    {result.sentiment === 'negative' && (
                      <div className="flex items-center gap-2 text-rose-400 text-2xl font-bold">
                        <AlertCircle className="w-7 h-7 text-rose-400 shadow-[0_0_10px_#fb7185]" />
                        <span>Negative Sentiment</span>
                      </div>
                    )}
                    {result.sentiment === 'neutral' && (
                      <div className="flex items-center gap-2 text-cyan-300 text-2xl font-bold">
                        <HelpCircle className="w-7 h-7 text-cyan-400 shadow-[0_0_10px_#38bdf8]" />
                        <span>Neutral Sentiment</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950/60 px-3.5 py-2 rounded-xl border border-white/5 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Polarity Score</div>
                    <div className={`text-lg font-bold font-mono ${
                      result.polarityScore > 0
                        ? 'text-emerald-400'
                        : result.polarityScore < 0
                        ? 'text-rose-400'
                        : 'text-cyan-300'
                    }`}>
                      {result.polarityScore > 0 ? `+${result.polarityScore.toFixed(2)}` : result.polarityScore.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 px-3.5 py-2 rounded-xl border border-white/5 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</div>
                    <div className="text-lg font-bold font-mono text-violet-300">
                      {(result.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">
                    {result.modelDetails?.modelLabel ?? 'Local lexicon fallback'}
                  </span>
                  <span className="text-slate-400">
                    {result.modelDetails?.featureMethod ?? 'Backend unavailable'}
                  </span>
                </div>
                {result.modelDetails && (
                  <>
                    <div className="flex flex-wrap gap-2 text-slate-300">
                      {Object.entries(result.modelDetails.probabilities).map(([label, probability]) => (
                        <span key={label} className="px-2 py-1 rounded bg-slate-900 border border-white/10 capitalize">
                          {label}: {(probability * 100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Top TF-IDF features</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.modelDetails.topFeatures.length ? result.modelDetails.topFeatures.map((feature) => (
                          <span key={feature} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-cyan-200 font-mono">
                            {feature}
                          </span>
                        )) : <span className="text-slate-400">Word2Vec document embedding ({result.modelDetails.word2VecDimensions} dimensions)</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Extracted n-grams</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.modelDetails.topNgrams.map(([ngram, count]) => (
                          <span key={ngram} className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-200 font-mono">
                            {ngram} <span className="text-slate-500">×{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500">
                      Trained on {result.modelDetails.trainingSamples} bundled labeled examples · {result.modelDetails.stopwordSource} · {result.modelDetails.lemmatizer}
                    </p>
                  </>
                )}
              </div>

              {/* Keyword Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20">
                  <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                    Positive Keyword Triggers ({result.positiveKeywordsFound.length})
                  </span>
                  {result.positiveKeywordsFound.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {result.positiveKeywordsFound.map((kw, idx) => (
                        <span key={idx} className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-xs font-semibold border border-emerald-500/30">
                          +{kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None detected</span>
                  )}
                </div>

                <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/20">
                  <span className="text-[11px] font-bold text-rose-400 block mb-1">
                    Negative Keyword Triggers ({result.negativeKeywordsFound.length})
                  </span>
                  {result.negativeKeywordsFound.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {result.negativeKeywordsFound.map((kw, idx) => (
                        <span key={idx} className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md text-xs font-semibold border border-rose-500/30">
                          -{kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Cleaned tokens */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
                <span className="font-semibold text-slate-300 block mb-1.5">
                  Lemmatized Tokens Used by the Classifier:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.tokens.length > 0 ? (
                    result.tokens.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded-md font-mono text-[11px] text-slate-200">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No tokens</span>
                  )}
                </div>
                {!!result.rawTokens?.length && (
                  <p className="text-slate-500 mt-2">
                    WordNet: {result.rawTokens.join(', ')} → {(result.lemmatizedTokens ?? result.tokens).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-14 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2.5 opacity-60" />
              <p className="text-sm font-semibold text-slate-200">Enter a review to see live sentiment classification and scores</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
