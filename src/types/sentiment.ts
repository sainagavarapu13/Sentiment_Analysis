export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface SentimentMetric {
  totalReviews: number;
  positiveReviews: number;
  positivePercentage: number;
  neutralReviews: number;
  neutralPercentage: number;
  negativeReviews: number;
  negativePercentage: number;
  overallSentiment: SentimentType;
  averageSentimentScore: number;
  topReviewedProduct: string;
  topProductReviewCount: number;
  topProductSentimentScore: number;
}

export interface MonthlyTrend {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  averageScore: number;
}

export interface CategoryMetric {
  category: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  averageScore: number;
}

export interface KeywordMetric {
  word: string;
  count: number;
  type: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface ReviewItem {
  id: string;
  source: 'Product Review' | 'Movie Review' | 'Customer Feedback' | 'Social Media';
  target: string; // e.g. "Product A", "Inception II", "Delivery Service"
  author: string;
  date: string;
  rating: number;
  text: string;
  sentiment: SentimentType;
  score: number; // -1 to +1
  confidence: number; // 0 to 1
  matchedKeywords: string[];
}

export interface NLPPipelineResult {
  rawText: string;
  cleanedText: string;
  rawTokens?: string[];
  lemmatizedTokens?: string[];
  tokens: string[];
  removedStopwords: string[];
  positiveKeywordsFound: string[];
  negativeKeywordsFound: string[];
  polarityScore: number; // -1 to +1
  normalizedScore: number; // 0 to 1
  sentiment: SentimentType;
  confidence: number;
  modelDetails?: {
    model: string;
    modelLabel: string;
    featureMethod: string;
    topFeatures: string[];
    topNgrams: [string, number][];
    probabilities: Record<SentimentType, number>;
    stopwordSource: string;
    lemmatizer: string;
    trainingSamples: number;
    word2VecDimensions: number | null;
  };
  emotionBreakdown: {
    joy: number;
    trust: number;
    anticipation: number;
    frustration: number;
    disappointment: number;
  };
  processingTimeMs: number;
}

export interface TeamMember {
  name: string;
  rollNo: string;
  role: string;
}
