import React, { useState, useEffect } from 'react';
import { runNLPPipeline } from '../utils/nlpEngine';
import { NLPPipelineResult, SentimentType } from '../types/sentiment';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sliders,
  RefreshCw,
  PlusCircle,
  Send,
  Zap,
} from 'lucide-react';

interface LiveNLPAnalyzerProps {
  initialText?: string;
  onAddReviewToDataset?: (text: string, sentiment: SentimentType, score: number, keywords: string[]) => void;
}

const PRESET_EXAMPLES = [
  {
    title: 'Product Review (Positive)',
    category: 'Product Review',
    text: 'The build quality is excellent and setup was remarkably fast and easy. Highly recommended for daily use!',
  },
  {
    title: 'Delivery Feedback (Negative)',
    category: 'Customer Feedback',
    text: 'Experiencing huge delay in shipment. Very poor response time from customer support and slow refund service.',
  },
  {
    title: 'Movie Review (Neutral)',
    category: 'Movie Review',
    text: 'The movie was released on Friday. The runtime is two hours and fifteen minutes with standard dialogue.',
  },
  {
    title: 'Social Comment (Negative)',
    category: 'Social Media',
    text: 'Way too expensive for what it delivers. Bad battery longevity and poor hardware casing.',
  },
  {
    title: 'Tech Review (Positive)',
    category: 'Product Review',
    text: 'Superb quality camera! Good battery life, fast charging, and love the clean responsive interface.',
  }
];

export const LiveNLPAnalyzer: React.FC<LiveNLPAnalyzerProps> = ({
  initialText = '',
  onAddReviewToDataset,
}) => {
  const [inputText, setInputText] = useState(
    initialText || 'The build quality is excellent and setup was remarkably fast and easy.'
  );
  const [result, setResult] = useState<NLPPipelineResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'stopwords' | 'emotions'>('tokens');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setResult(runNLPPipeline(initialText));
      setIsAdded(false);
    }
  }, [initialText]);

  useEffect(() => {
    if (inputText.trim()) {
      const res = runNLPPipeline(inputText);
      setResult(res);
      setIsAdded(false);
    } else {
      setResult(null);
    }
  }, [inputText]);

  const handleAddReview = () => {
    if (!result || isAdded || !onAddReviewToDataset) return;
    const combinedKeywords = [...result.positiveKeywordsFound, ...result.negativeKeywordsFound];
    onAddReviewToDataset(result.rawText, result.sentiment, result.polarityScore, combinedKeywords);
    setIsAdded(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Interactive NLP Laboratory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Real-Time Natural Language Processing Pipeline
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Experience the complete systematic process: ingest raw unstructured text, strip noise, tokenize,
            filter stopwords, extract polarity-weighted features, and classify into Positive, Neutral, or Negative sentiment.
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 mb-2">Try Sample Text from Dataset:</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((example) => (
              <button
                key={example.title}
                onClick={() => {
                  setInputText(example.text);
                  setIsAdded(false);
                }}
                className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{example.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workbench: Input on Left, Pipeline Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Box */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="nlp-text-input" className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Input Raw Text
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            </div>
            <textarea
              id="nlp-text-input"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type any customer review, product opinion, or comment to classify..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none leading-relaxed text-slate-800 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>{inputText.length} characters · {inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
            {result && (
              <span className="font-mono text-emerald-600 font-medium">
                Latency: {result.processingTimeMs}ms
              </span>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                if (inputText.trim()) {
                  setResult(runNLPPipeline(inputText));
                  setIsAdded(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run NLP Classification</span>
            </button>

            {onAddReviewToDataset && result && (
              <button
                onClick={handleAddReview}
                disabled={isAdded}
                className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 cursor-default'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 cursor-pointer'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Added to Global Dashboard Dataset</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add to Live Review Database</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pipeline Stages & Prediction Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* Result Summary Card */}
          {result ? (
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Predicted Classification
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    {result.sentiment === 'positive' && (
                      <div className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span>Positive Sentiment</span>
                      </div>
                    )}
                    {result.sentiment === 'negative' && (
                      <div className="flex items-center gap-2 text-rose-600 text-xl font-bold">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                        <span>Negative Sentiment</span>
                      </div>
                    )}
                    {result.sentiment === 'neutral' && (
                      <div className="flex items-center gap-2 text-slate-700 text-xl font-bold">
                        <HelpCircle className="w-6 h-6 text-slate-500" />
                        <span>Neutral Sentiment</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Confidence Metric Blocks */}
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Polarity Score</div>
                    <div className={`text-base font-bold font-mono ${
                      result.polarityScore > 0
                        ? 'text-emerald-600'
                        : result.polarityScore < 0
                        ? 'text-rose-600'
                        : 'text-slate-700'
                    }`}>
                      {result.polarityScore > 0 ? `+${result.polarityScore.toFixed(2)}` : result.polarityScore.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Confidence</div>
                    <div className="text-base font-bold font-mono text-indigo-600">
                      {(result.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step NLP Pipeline Visualizer */}
              <div className="mt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  NLP Pipeline Decomposition
                </h4>

                {/* Stage 1: Cleaning & Preprocessing */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5 font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
                      Text Preprocessing (Lowercased & Noise Stripped)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Punctuation & Special Chars Removed</span>
                  </div>
                  <p className="font-mono text-slate-800 bg-white p-2.5 rounded border border-slate-200 text-xs">
                    "{result.cleanedText || 'No text'}"
                  </p>
                </div>

                {/* Stage 2: Stopwords & Tokenization */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2 font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
                      Token Representation & Stopword Removal
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => setActiveTab('tokens')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          activeTab === 'tokens' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Retained Tokens ({result.tokens.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('stopwords')}
                        className={`px-2 py-0.5 rounded font-medium ${
                          activeTab === 'stopwords' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Removed Stopwords ({result.removedStopwords.length})
                      </button>
                    </div>
                  </div>

                  {activeTab === 'tokens' ? (
                    <div className="flex flex-wrap gap-1.5 bg-white p-2.5 rounded border border-slate-200 min-h-[44px]">
                      {result.tokens.map((token, idx) => {
                        const isPos = result.positiveKeywordsFound.includes(token);
                        const isNeg = result.negativeKeywordsFound.includes(token);

                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded font-mono text-xs font-medium border ${
                              isPos
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isNeg
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {token}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 bg-white p-2.5 rounded border border-slate-200 min-h-[44px]">
                      {result.removedStopwords.length > 0 ? (
                        result.removedStopwords.map((sw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded font-mono text-xs text-slate-400 bg-slate-50 line-through border border-slate-200"
                          >
                            {sw}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No stopwords found</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stage 3: Lexicon Feature Extraction */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2 font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                      Extracted Sentiment Lexicon Triggers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Positive matches */}
                    <div className="p-2.5 bg-emerald-50/60 rounded-md border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                        Positive Triggers ({result.positiveKeywordsFound.length})
                      </span>
                      {result.positiveKeywordsFound.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.positiveKeywordsFound.map((kw, idx) => (
                            <span key={idx} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                              +{kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">None detected</span>
                      )}
                    </div>

                    {/* Negative matches */}
                    <div className="p-2.5 bg-rose-50/60 rounded-md border border-rose-100">
                      <span className="text-[11px] font-bold text-rose-800 block mb-1">
                        Negative Triggers ({result.negativeKeywordsFound.length})
                      </span>
                      {result.negativeKeywordsFound.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.negativeKeywordsFound.map((kw, idx) => (
                            <span key={idx} className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                              -{kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">None detected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emotional Dimensions Breakdown */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2 font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
                      Affective Emotion Distribution
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result.emotionBreakdown).map(([emotion, val]) => (
                      <div key={emotion} className="flex items-center justify-between gap-3">
                        <span className="capitalize text-slate-700 font-medium w-24 text-[11px]">{emotion}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              emotion === 'joy' || emotion === 'trust'
                                ? 'bg-emerald-500'
                                : emotion === 'frustration' || emotion === 'disappointment'
                                ? 'bg-rose-500'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 font-semibold w-8 text-right text-[11px]">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200/80 shadow-xs text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">Type text or click one of the presets to view live NLP classification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
