import React, { useState } from 'react';
import { runNLPPipeline, runNLPPipelineFromBackend } from '../utils/nlpEngine';
import { ReviewItem } from '../types/sentiment';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchProcessed: (newReviews: ReviewItem[]) => void;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onBatchProcessed,
}) => {
  const [rawPastedText, setRawPastedText] = useState('');
  const [sourceType, setSourceType] = useState<'Product Review' | 'Customer Feedback' | 'Movie Review' | 'Social Media'>('Product Review');
  const [targetEntity, setTargetEntity] = useState('Product A');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleProcessBatch = async () => {
    if (!rawPastedText.trim()) return;

    setIsProcessing(true);
    const lines = rawPastedText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    const generatedReviews: ReviewItem[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const text = lines[idx];
      const nlp = (await runNLPPipelineFromBackend(text)) ?? runNLPPipeline(text);
      const rating = nlp.sentiment === 'positive' ? 5 : nlp.sentiment === 'negative' ? 1 : 3;

      generatedReviews.push({
        id: `REV-${5100 + idx}`,
        source: sourceType,
        target: targetEntity,
        author: `User_${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        rating,
        text,
        sentiment: nlp.sentiment,
        score: nlp.polarityScore,
        confidence: nlp.confidence,
        matchedKeywords: [...nlp.positiveKeywordsFound, ...nlp.negativeKeywordsFound],
      });
    }

    setTimeout(() => {
      onBatchProcessed(generatedReviews);
      setProcessedCount(generatedReviews.length);
      setIsProcessing(false);
      setTimeout(() => {
        setProcessedCount(null);
        setRawPastedText('');
        onClose();
      }, 1200);
    }, 400);
  };

  const handleSampleLoad = () => {
    setRawPastedText(
      `The build quality is excellent and setup was fast.\nDelivery had a massive delay and very poor support.\nStandard device with good battery life.\nThe application is too expensive and slow to open.\nLoved the easy navigation and clean design!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Reviews to Pipeline</h3>
              <p className="text-xs text-slate-500">Paste text lines or load sample batch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Source Category</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Product Review">Product Review</option>
                <option value="Customer Feedback">Customer Feedback</option>
                <option value="Movie Review">Movie Review</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Entity / Product</label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="e.g. Product A, Product B"
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Raw Reviews (one per line)
              </label>
              <button
                type="button"
                onClick={handleSampleLoad}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Insert sample text
              </button>
            </div>
            <textarea
              rows={6}
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              placeholder="Paste reviews here, one review on each line:&#10;Excellent product, very fast shipping!&#10;Poor service and delayed response."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-slate-50/50"
            />
          </div>

          {processedCount !== null && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Successfully processed and classified {processedCount} reviews!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessBatch}
            disabled={!rawPastedText.trim() || isProcessing}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            {isProcessing ? 'Analyzing Pipeline...' : 'Process & Ingest'}
          </button>
        </div>
      </div>
    </div>
  );
};
