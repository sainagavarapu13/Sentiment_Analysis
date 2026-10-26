import React from 'react';
import { TEAM_MEMBERS, PROJECT_ABSTRACT } from '../data/mockData';
import { Users, BookOpen, CheckCircle2, Award, FileText, Download } from 'lucide-react';

export const ProjectTeamSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Project Abstract Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Documentation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sentiment Analysis System — Project Abstract
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">NLP-based Text Classification & Dashboard Analytics</p>
          </div>
        </div>

        {/* Abstract Prose */}
        <div className="mt-5 prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            The <strong>Sentiment Analysis System</strong> is an NLP-based project designed to analyze and understand opinions,
            emotions, and feedback expressed through textual data. The system can process data obtained from various sources,
            including product reviews, movie reviews, customer feedback, and social media comments. Its main purpose is to
            automatically identify the sentiment of the given text and categorize it into <strong>Positive, Negative, or Neutral</strong> classes.
          </p>
          <p>
            The project follows a systematic process that begins with collecting a suitable text dataset. The collected data is then
            preprocessed by removing unnecessary characters, common words, and other unwanted elements to improve the quality of the text.
            After preprocessing, the text data is converted into a suitable representation for sentiment analysis, allowing the system to
            determine the sentiment associated with each review or comment.
          </p>
          <p>
            To make the analyzed information easier to understand, the results are presented through statistical summaries and interactive
            visualizations. The proposed system provides a <strong>Sentiment Analysis Dashboard</strong> containing important insights such as the
            total number of reviews analyzed, distribution of positive, negative, and neutral sentiments, frequently used words, sentiment trends,
            and category-wise sentiment analysis.
          </p>
          <p>
            The developed system helps users quickly understand overall public opinion and identify important sentiment patterns, thereby
            supporting effective and data-driven decision making. Furthermore, the project provides practical experience in the complete NLP pipeline,
            including data collection, text preprocessing, sentiment classification, data visualization, result interpretation, and dashboard development.
            It also strengthens students' technical, analytical, programming, and problem-solving abilities.
          </p>
        </div>
      </div>

      {/* Project Team & Contributors Table (From Page 3 of PDF) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Project By</h3>
              <p className="text-xs text-slate-500">Student research & engineering team credentials</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Computer Science & Engineering
          </span>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={member.rollNo}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-mono text-indigo-600 font-bold">0{index + 1}</span>
                  <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {member.rollNo}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{member.role}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Contributor</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified System Outputs & Metrics Audit */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Sample Output Verification Matrix (From Project Specification)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block text-[11px]">1. Total Reviews Analyzed</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">5,000 Reviews</span>
            <span className="text-[11px] text-slate-500">Collected from 4 textual sources</span>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <span className="text-emerald-700 block text-[11px]">2. Positive Proportion</span>
            <span className="text-lg font-bold text-emerald-700 mt-1 block">3,150 (63%)</span>
            <span className="text-[11px] text-emerald-600">Predominantly positive consensus</span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-slate-500 block text-[11px]">3. Neutral Proportion</span>
            <span className="text-lg font-bold text-slate-800 mt-1 block">950 (19%)</span>
            <span className="text-[11px] text-slate-500">Objective / factual statements</span>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40">
            <span className="text-rose-700 block text-[11px]">4. Negative Proportion</span>
            <span className="text-lg font-bold text-rose-700 mt-1 block">900 (18%)</span>
            <span className="text-[11px] text-rose-600">Critical complaints and issues</span>
          </div>

          <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40">
            <span className="text-indigo-700 block text-[11px]">5. Average Sentiment Score</span>
            <span className="text-lg font-bold text-indigo-700 mt-1 block">0.72 Polarity</span>
            <span className="text-[11px] text-indigo-600">Normalized polarity index</span>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
            <span className="text-amber-800 block text-[11px]">6. Top Reviewed Entity</span>
            <span className="text-lg font-bold text-amber-800 mt-1 block">Product A</span>
            <span className="text-[11px] text-amber-700">Highest volume & customer loyalty</span>
          </div>
        </div>
      </div>
    </div>
  );
};
