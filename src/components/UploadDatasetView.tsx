import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  FolderUp,
  SlidersHorizontal,
  Play,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { inspectUploadedFile, inspectUploadedFileWithBackend, processInspectedRows, processInspectedRowsWithBackend, RawFileInspection, ParsedDatasetResult } from '../utils/fileParser';

interface UploadDatasetViewProps {
  onDatasetAnalyzed: (data: ParsedDatasetResult) => void;
  onCancel?: () => void;
}

export const UploadDatasetView: React.FC<UploadDatasetViewProps> = ({
  onDatasetAnalyzed,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inspection, setInspection] = useState<RawFileInspection | null>(null);

  const [selectedTextCol, setSelectedTextCol] = useState<string>('');
  const [selectedTargetCol, setSelectedTargetCol] = useState<string>('');
  const [selectedDateCol, setSelectedDateCol] = useState<string>('');
  const [selectedRatingCol, setSelectedRatingCol] = useState<string>('');

  const handleFile = async (file: File) => {
    setError(null);
    setIsReading(true);
    setInspection(null);

    try {
      const inspected = await inspectUploadedFileWithBackend(file) ?? await inspectUploadedFile(file);
      setInspection(inspected);
      setSelectedTextCol(inspected.suggestedTextColumn || inspected.columns[0]);
      setSelectedTargetCol(inspected.suggestedTargetColumn || '');
      setSelectedDateCol(inspected.suggestedDateColumn || '');
      setSelectedRatingCol(inspected.suggestedRatingColumn || '');
      setIsReading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to read file. Please ensure it contains tabular rows or textual review data.');
      setIsReading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!inspection || !selectedTextCol) {
      setError('Please select the text column containing reviews or comments.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const backendResult = await processInspectedRowsWithBackend(
        inspection,
        selectedTextCol,
        selectedTargetCol || undefined,
        selectedDateCol || undefined,
        selectedRatingCol || undefined
      );

      const result = backendResult ?? processInspectedRows(
        inspection,
        selectedTextCol,
        selectedTargetCol || undefined,
        selectedDateCol || undefined,
        selectedRatingCol || undefined
      );

      onDatasetAnalyzed(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while analyzing dataset with NLP pipeline.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <FolderUp className="w-4 h-4" />
            <span>Dataset Ingestion Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Upload & Analyze Dataset
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Upload your file in <strong>CSV, XLSX, XLS, JSON, or PDF</strong> format.
            Preview rows, select or confirm the review text column, and click <strong>Analyze Dataset</strong> to populate the dashboard.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer relative z-10"
          >
            Cancel
          </button>
        )}
      </div>

      {/* STEP 1: Upload File Drag & Drop Box */}
      {!inspection && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-panel rounded-3xl border-2 border-dashed p-10 sm:p-16 text-center transition-all duration-300 relative overflow-hidden ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-[0_0_40px_rgba(6,182,212,0.25)]'
              : 'border-white/15 hover:border-violet-400/50 bg-slate-950/40'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json,.pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto flex flex-col items-center relative z-10">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/30 border border-white/10 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
              {isReading ? (
                <Loader2 className="w-9 h-9 animate-spin text-cyan-300" />
              ) : (
                <UploadCloud className="w-9 h-9 text-cyan-300" />
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {isReading ? 'Reading file schema...' : 'Drop your dataset here'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Supported: <strong className="text-slate-200">CSV • XLSX</strong> (also XLS, JSON, PDF)
            </p>

            <button
              type="button"
              disabled={isReading}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            {error && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Pre-Analysis Preview & Column Selection */}
      {inspection && (
        <div className="space-y-6">
          {/* File Overview Bar */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{inspection.fileName}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                    {inspection.totalRows.toLocaleString()} Rows Detected
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {inspection.columns.length} columns detected in file
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInspection(null);
                setError(null);
              }}
              className="text-xs text-cyan-400 hover:text-white underline self-start sm:self-auto cursor-pointer"
            >
              Choose different file
            </button>
          </div>

          {/* Column Mapping Selectors */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">
                Confirm & Map Dataset Columns
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Verify the column that contains the customer reviews or textual opinions. You can also map optional columns for products, dates, and ratings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Review Text Column (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>Review / Text Column *</span>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Required</span>
                </label>
                <select
                  value={selectedTextCol}
                  onChange={(e) => setSelectedTextCol(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-indigo-500/40 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {inspection.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Text to be analyzed with NLP pipeline
                </span>
              </div>

              {/* Product / Entity Column (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Product / Entity Column</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <select
                  value={selectedTargetCol}
                  onChange={(e) => setSelectedTargetCol(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">(None / General)</option>
                  {inspection.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Used for top product analysis
                </span>
              </div>

              {/* Date Column (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Date Column</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <select
                  value={selectedDateCol}
                  onChange={(e) => setSelectedDateCol(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">(None / No Trend)</option>
                  {inspection.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Generates monthly sentiment trends
                </span>
              </div>

              {/* Rating Column (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Rating / Star Column</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <select
                  value={selectedRatingCol}
                  onChange={(e) => setSelectedRatingCol(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">(Auto-detect)</option>
                  {inspection.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  1-5 Star rating if available
                </span>
              </div>
            </div>
          </div>

          {/* Dataset Row Preview */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Data Preview (First 5 Rows)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Selected Text: <strong className="text-cyan-300">{selectedTextCol}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 text-[11px] font-bold">
                    <th className="py-2.5 px-3">#</th>
                    {inspection.columns.map((col) => (
                      <th
                        key={col}
                        className={`py-2.5 px-3 whitespace-nowrap ${
                          col === selectedTextCol
                            ? 'text-cyan-300 bg-cyan-950/40 font-extrabold'
                            : ''
                        }`}
                      >
                        {col} {col === selectedTextCol && '★ (Text)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inspection.previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                      {inspection.columns.map((col) => (
                        <td
                          key={col}
                          className={`py-2 px-3 max-w-xs truncate ${
                            col === selectedTextCol
                              ? 'bg-cyan-950/20 font-medium text-white'
                              : 'text-slate-300'
                          }`}
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button: Analyze Dataset */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setInspection(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isAnalyzing || !selectedTextCol}
              onClick={handleStartAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-[0_0_25px_rgba(99,102,241,0.35)] flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing NLP Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Analyze Dataset</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
