import * as XLSX from 'xlsx';
import { runNLPPipeline } from './nlpEngine';
import { inspectFileWithBackend, processDatasetWithBackend } from '../services/backend';
import { ReviewItem, SentimentMetric, MonthlyTrend, CategoryMetric, KeywordMetric } from '../types/sentiment';

export interface RawFileInspection {
  fileName: string;
  totalRows: number;
  columns: string[];
  suggestedTextColumn: string;
  suggestedTargetColumn: string;
  suggestedDateColumn: string;
  suggestedRatingColumn: string;
  previewRows: Array<Record<string, any>>;
  rawRows: any[];
}

export interface ParsedDatasetResult {
  datasetName: string;
  reviews: ReviewItem[];
  metrics: SentimentMetric;
  monthlyTrends: MonthlyTrend[];
  categoryMetrics: CategoryMetric[];
  keywordMetrics: KeywordMetric[];
}

/**
 * Inspects uploaded file and extracts header columns and rows for preview & column selection
 */
export async function inspectUploadedFileWithBackend(file: File): Promise<RawFileInspection | null> {
  const backendInspection = await inspectFileWithBackend(file);
  if (!backendInspection) {
    return null;
  }

  return {
    fileName: backendInspection.file_name ?? backendInspection.fileName ?? file.name,
    totalRows: Number(backendInspection.total_rows ?? backendInspection.totalRows ?? 0),
    columns: backendInspection.columns ?? [],
    suggestedTextColumn: backendInspection.suggested_text_column ?? backendInspection.suggestedTextColumn ?? '',
    suggestedTargetColumn: backendInspection.suggested_target_column ?? backendInspection.suggestedTargetColumn ?? '',
    suggestedDateColumn: backendInspection.suggested_date_column ?? backendInspection.suggestedDateColumn ?? '',
    suggestedRatingColumn: backendInspection.suggested_rating_column ?? backendInspection.suggestedRatingColumn ?? '',
    previewRows: backendInspection.preview_rows ?? backendInspection.previewRows ?? [],
    rawRows: backendInspection.raw_rows ?? backendInspection.rawRows ?? [],
  };
}

export async function inspectUploadedFile(file: File): Promise<RawFileInspection> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rawRows: any[] = [];

  if (extension === 'json') {
    const text = await file.text();
    const parsed = JSON.parse(text);
    rawRows = Array.isArray(parsed) ? parsed : (parsed.reviews || parsed.data || parsed.comments || [parsed]);
  } else if (extension === 'csv') {
    const text = await file.text();
    const workbook = XLSX.read(text, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else if (extension === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += '\n' + pageString;
    }
    const sentences = fullText
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);

    rawRows = sentences.map((text, idx) => ({
      Review_Text: text,
      Entity: 'Document Text',
      Index: idx + 1,
    }));
  } else {
    // Text file: line by line
    const text = await file.text();
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    rawRows = lines.map((line, idx) => ({
      Review_Text: line,
      Index: idx + 1,
    }));
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded file is empty or could not be read.');
  }

  // Determine all unique column keys
  const columnsSet = new Set<string>();
  rawRows.slice(0, 50).forEach(row => {
    if (typeof row === 'object' && row !== null) {
      Object.keys(row).forEach(k => columnsSet.add(k));
    }
  });

  let columns = Array.from(columnsSet);
  if (columns.length === 0) {
    columns = ['Review_Text'];
    rawRows = rawRows.map(r => ({ Review_Text: String(r) }));
  }

  // Intelligent column detection
  const suggestedTextColumn =
    columns.find(k => /^(review|comment|text|feedback|body|content|opinion|message|description)$/i.test(k)) ||
    columns.find(k => /review|comment|text|feedback|opinion|body|content/i.test(k)) ||
    columns[0];

  const suggestedTargetColumn =
    columns.find(k => /^(product|entity|item|brand|movie|category|service|title|target|name)$/i.test(k)) ||
    columns.find(k => /product|entity|item|brand|movie|category|service|title|target/i.test(k)) ||
    '';

  const suggestedDateColumn =
    columns.find(k => /^(date|timestamp|time|created_at|created|month)$/i.test(k)) ||
    columns.find(k => /date|time|created|timestamp|month/i.test(k)) ||
    '';

  const suggestedRatingColumn =
    columns.find(k => /^(rating|stars|score|rate)$/i.test(k)) ||
    columns.find(k => /rating|stars|score|rate/i.test(k)) ||
    '';

  return {
    fileName: file.name,
    totalRows: rawRows.length,
    columns,
    suggestedTextColumn,
    suggestedTargetColumn,
    suggestedDateColumn,
    suggestedRatingColumn,
    previewRows: rawRows.slice(0, 5),
    rawRows,
  };
}

/**
 * Processes user-confirmed column mapping and runs the complete NLP pipeline
 */
export async function processInspectedRowsWithBackend(
  inspection: RawFileInspection,
  textColumn: string,
  targetColumn?: string,
  dateColumn?: string,
  ratingColumn?: string
): Promise<ParsedDatasetResult | null> {
  const backendResult = await processDatasetWithBackend({
    inspection,
    text_column: textColumn,
    target_column: targetColumn,
    date_column: dateColumn,
    rating_column: ratingColumn,
  });

  if (!backendResult) {
    return null;
  }

  return {
    datasetName: backendResult.datasetName ?? backendResult.dataset_name ?? 'Dataset',
    reviews: backendResult.reviews ?? [],
    metrics: backendResult.metrics ?? {
      totalReviews: 0,
      positiveReviews: 0,
      positivePercentage: 0,
      neutralReviews: 0,
      neutralPercentage: 0,
      negativeReviews: 0,
      negativePercentage: 0,
      overallSentiment: 'neutral',
      averageSentimentScore: 0,
      topReviewedProduct: 'None',
      topProductReviewCount: 0,
      topProductSentimentScore: 0,
    },
    monthlyTrends: backendResult.monthlyTrends ?? backendResult.monthly_trends ?? [],
    categoryMetrics: backendResult.categoryMetrics ?? backendResult.category_metrics ?? [],
    keywordMetrics: backendResult.keywordMetrics ?? backendResult.keyword_metrics ?? [],
  };
}

export function processInspectedRows(
  inspection: RawFileInspection,
  textColumn: string,
  targetColumn?: string,
  dateColumn?: string,
  ratingColumn?: string
): ParsedDatasetResult {
  const reviews: ReviewItem[] = [];

  inspection.rawRows.forEach((row, index) => {
    let rawText = '';
    if (typeof row === 'string') {
      rawText = row.trim();
    } else if (typeof row === 'object' && row !== null) {
      rawText = String(row[textColumn] || '').trim();
      if (!rawText) {
        // Fallback search across row
        const val = Object.values(row).find(v => typeof v === 'string' && v.trim().length > 10);
        rawText = val ? String(val).trim() : '';
      }
    }

    if (!rawText || rawText.length < 2) return;

    const nlp = runNLPPipeline(rawText);

    // Target entity
    let target = 'General';
    if (targetColumn && row[targetColumn]) {
      target = String(row[targetColumn]).trim();
    }

    // Date
    let date = '';
    if (dateColumn && row[dateColumn]) {
      date = String(row[dateColumn]).trim();
    }

    // Rating
    let rating = nlp.sentiment === 'positive' ? 5 : nlp.sentiment === 'negative' ? 1 : 3;
    if (ratingColumn && row[ratingColumn] && !isNaN(Number(row[ratingColumn]))) {
      rating = Math.max(1, Math.min(5, Math.round(Number(row[ratingColumn]))));
    }

    reviews.push({
      id: `REV-${1000 + reviews.length + 1}`,
      source: 'Customer Feedback',
      target: target || 'General',
      author: row.author || row.Author || row.user || row.Username || `Reviewer_${index + 1}`,
      date: date || new Date().toISOString().split('T')[0],
      rating,
      text: rawText,
      sentiment: nlp.sentiment,
      score: nlp.polarityScore,
      confidence: nlp.confidence,
      matchedKeywords: [...nlp.positiveKeywordsFound, ...nlp.negativeKeywordsFound],
    });
  });

  if (reviews.length === 0) {
    throw new Error(`No valid reviews could be extracted using column "${textColumn}". Please select another text column.`);
  }

  const datasetName = inspection.fileName.replace(/\.[^/.]+$/, '');
  return calculateDatasetAnalytics(reviews, datasetName);
}

/**
 * Computes strictly data-driven analytics from the actual reviews without fake fallbacks
 */
export function calculateDatasetAnalytics(reviews: ReviewItem[], datasetName: string): ParsedDatasetResult {
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      datasetName,
      reviews: [],
      metrics: {
        totalReviews: 0,
        positiveReviews: 0,
        positivePercentage: 0,
        neutralReviews: 0,
        neutralPercentage: 0,
        negativeReviews: 0,
        negativePercentage: 0,
        overallSentiment: 'neutral',
        averageSentimentScore: 0,
        topReviewedProduct: 'None',
        topProductReviewCount: 0,
        topProductSentimentScore: 0,
      },
      monthlyTrends: [],
      categoryMetrics: [],
      keywordMetrics: [],
    };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalScoreSum = 0;

  const entityMap: Record<string, { total: number; pos: number; neu: number; neg: number; scoreSum: number }> = {};
  const monthMap: Record<string, { total: number; pos: number; neu: number; neg: number; scoreSum: number }> = {};
  const wordCountMap: Record<string, { count: number; type: 'positive' | 'negative' | 'neutral'; scoreSum: number }> = {};

  reviews.forEach((r) => {
    if (r.sentiment === 'positive') positiveCount++;
    else if (r.sentiment === 'negative') negativeCount++;
    else neutralCount++;

    const normalized = (r.score + 1) / 2;
    totalScoreSum += normalized;

    // Entity
    const entity = (r.target || 'General').trim();
    if (!entityMap[entity]) {
      entityMap[entity] = { total: 0, pos: 0, neu: 0, neg: 0, scoreSum: 0 };
    }
    entityMap[entity].total++;
    if (r.sentiment === 'positive') entityMap[entity].pos++;
    else if (r.sentiment === 'negative') entityMap[entity].neg++;
    else entityMap[entity].neu++;
    entityMap[entity].scoreSum += normalized;

    // Month extraction
    let monthLabel = '';
    if (r.date) {
      const parsedD = new Date(r.date);
      if (!isNaN(parsedD.getTime())) {
        monthLabel = parsedD.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else {
        const parts = r.date.split('-');
        if (parts.length > 1) monthLabel = parts.slice(0, 2).join('-');
        else monthLabel = r.date;
      }
    }
    if (monthLabel) {
      if (!monthMap[monthLabel]) {
        monthMap[monthLabel] = { total: 0, pos: 0, neu: 0, neg: 0, scoreSum: 0 };
      }
      monthMap[monthLabel].total++;
      if (r.sentiment === 'positive') monthMap[monthLabel].pos++;
      else if (r.sentiment === 'negative') monthMap[monthLabel].neg++;
      else monthMap[monthLabel].neu++;
      monthMap[monthLabel].scoreSum += normalized;
    }

    // Matched keywords
    r.matchedKeywords.forEach((kw) => {
      const lower = kw.toLowerCase();
      if (!wordCountMap[lower]) {
        wordCountMap[lower] = {
          count: 0,
          type: r.sentiment,
          scoreSum: 0,
        };
      }
      wordCountMap[lower].count++;
      wordCountMap[lower].scoreSum += r.score;
    });
  });

  const posPct = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const neuPct = totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0;
  const negPct = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;

  let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (posPct >= neuPct && posPct >= negPct) overallSentiment = 'positive';
  else if (negPct >= posPct && negPct >= neuPct) overallSentiment = 'negative';

  const averageSentimentScore = totalReviews > 0 ? Number((totalScoreSum / totalReviews).toFixed(2)) : 0;

  // Sorted entities
  const sortedEntities = Object.entries(entityMap).sort((a, b) => b[1].total - a[1].total);
  const topEntityEntry = sortedEntities[0];
  const topReviewedProduct = topEntityEntry ? topEntityEntry[0] : 'None';
  const topProductReviewCount = topEntityEntry ? topEntityEntry[1].total : 0;
  const topProductSentimentScore = topEntityEntry ? Number((topEntityEntry[1].scoreSum / Math.max(1, topEntityEntry[1].total)).toFixed(2)) : 0;

  const metrics: SentimentMetric = {
    totalReviews,
    positiveReviews: positiveCount,
    positivePercentage: posPct,
    neutralReviews: neutralCount,
    neutralPercentage: neuPct,
    negativeReviews: negativeCount,
    negativePercentage: negPct,
    overallSentiment,
    averageSentimentScore,
    topReviewedProduct,
    topProductReviewCount,
    topProductSentimentScore,
  };

  // Category Metrics: only from actual entities in dataset
  const categoryMetrics: CategoryMetric[] = sortedEntities.slice(0, 10).map(([cat, val]) => ({
    category: cat,
    total: val.total,
    positive: val.pos,
    neutral: val.neu,
    negative: val.neg,
    averageScore: Number((val.scoreSum / val.total).toFixed(2)),
  }));

  // Monthly trends: only from actual dates in dataset
  const monthlyTrends: MonthlyTrend[] = Object.entries(monthMap).map(([m, val]) => ({
    month: m,
    total: val.total,
    positive: val.pos,
    neutral: val.neu,
    negative: val.neg,
    averageScore: Number((val.scoreSum / val.total).toFixed(2)),
  }));

  // Keywords: strictly extracted from current reviews
  const keywordMetrics: KeywordMetric[] = Object.entries(wordCountMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 30)
    .map(([word, val]) => ({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      count: val.count,
      type: val.type,
      score: Number((val.scoreSum / val.count).toFixed(2)),
    }));

  return {
    datasetName,
    reviews,
    metrics,
    monthlyTrends,
    categoryMetrics,
    keywordMetrics,
  };
}
