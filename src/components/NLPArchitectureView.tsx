import React from 'react';
import { Database, Filter, Binary, CheckSquare, BarChart, Lightbulb, ArrowRight } from 'lucide-react';

export const NLPArchitectureView: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Data Collection & Ingestion',
      icon: Database,
      tag: 'Multi-Source',
      description:
        'Harvests text corpus from product reviews (e.g. Product A, B, C, D), movie reviews, customer feedback tickets, and social media commentary.',
      details: [
        'Supports CSV, JSON, and live unstructured text feeds',
        'Raw rating correlation (1-5 stars)',
        'Metadata extraction (author, timestamp, product SKU)'
      ]
    },
    {
      num: '02',
      title: 'Text Preprocessing & Sanitization',
      icon: Filter,
      tag: 'Noise Reduction',
      description:
        'Cleans and standardizes raw textual data by removing unwanted elements to substantially improve model quality and accuracy.',
      details: [
        'Punctuation and URL/emoji stripping',
        'Case folding (lowercasing all characters)',
        'Stop-word filtering (eliminating high-frequency syntactic noise)',
        'Negation handling (e.g., preserving "not good" vs "good")'
      ]
    },
    {
      num: '03',
      title: 'Representation & Polarity Scoring',
      icon: Binary,
      tag: 'Feature Extraction',
      description:
        'Converts sanitized tokens into numerical representations and maps them against positive and negative sentiment lexicon weights.',
      details: [
        'Intensifier weighting (e.g., "extremely fast")',
        'Keyword polarity calculation (-1.00 to +1.00)',
        'Confidence score generation based on keyword density'
      ]
    },
    {
      num: '04',
      title: 'Sentiment Classification',
      icon: CheckSquare,
      tag: 'Discrete Classes',
      description:
        'Categorizes each review or text sequence into discrete classes: Positive, Neutral, or Negative, alongside continuous sentiment polarity scores.',
      details: [
        'Positive (> +0.15 polarity threshold)',
        'Neutral (-0.15 to +0.15 polarity threshold)',
        'Negative (< -0.15 polarity threshold)',
        'Multi-dimensional emotion profiling'
      ]
    },
    {
      num: '05',
      title: 'Visualization & Dashboard Analytics',
      icon: BarChart,
      tag: 'Decision Support',
      description:
        'Presents statistical summaries and interactive visualizations to help users and stakeholders quickly understand public opinion.',
      details: [
        'Summary KPIs (5,000 reviews, 63% Positive, 19% Neutral, 18% Negative)',
        'Pie / Donut chart distribution',
        'Six-month sentiment trends (January to June)',
        'Category comparison & keyword word cloud'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Lightbulb className="w-4 h-4" />
          <span>System Architecture & Pipeline</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Systematic NLP Sentiment Analysis Pipeline
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          The Sentiment Analysis System follows a systematic process starting from data collection, rigorous text preprocessing,
          lexicon representation, polarity classification, and culminating in interactive visual analytics for data-driven decisions.
        </p>
      </div>

      {/* Sequential Flow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {step.tag}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{step.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <ul className="space-y-1.5 text-[11px] text-slate-500">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold mt-0.5">·</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Specifications Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-3">Pipeline Parameter Specifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Technique / Formula</th>
                <th className="py-2.5 px-3">Primary Output</th>
                <th className="py-2.5 px-3">Purpose in Abstract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Preprocessing</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">Regex sanitizer + lowercasing</td>
                <td className="py-2.5 px-3 text-slate-700">Clean normalized text string</td>
                <td className="py-2.5 px-3 text-slate-500">Eliminate unwanted punctuation and emojis</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Tokenization</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">Whitespace split + Stopword hash set</td>
                <td className="py-2.5 px-3 text-slate-700">Content tokens list</td>
                <td className="py-2.5 px-3 text-slate-500">Strip high-frequency common words</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Lexicon Mapping</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">AFINN / VADER Polarity Scoring</td>
                <td className="py-2.5 px-3 text-slate-700">Polarity range [-1.0, +1.0]</td>
                <td className="py-2.5 px-3 text-slate-500">Detect Excellent, Good, Fast vs Delay, Poor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Classification</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">Threshold gating (|score| &gt; 0.15)</td>
                <td className="py-2.5 px-3 font-semibold text-emerald-700">Positive, Neutral, Negative</td>
                <td className="py-2.5 px-3 text-slate-500">Categorize reviews into 3 primary classes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
