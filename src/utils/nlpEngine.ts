import { NLPPipelineResult, SentimentType } from '../types/sentiment';
import { analyzeTextWithBackend } from '../services/backend';

// Common English stopwords to remove during NLP preprocessing
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
  'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Explicit dictionary with weights (including all keywords from Project Abstract)
const POSITIVE_LEXICON: Record<string, number> = {
  excellent: 3.5,
  good: 2.2,
  fast: 2.5,
  quality: 2.8,
  easy: 2.4,
  great: 3.0,
  amazing: 3.4,
  love: 3.2,
  loved: 3.2,
  best: 3.2,
  perfect: 3.6,
  smooth: 2.3,
  reliable: 2.7,
  awesome: 3.1,
  superb: 3.3,
  recommend: 2.6,
  happy: 2.5,
  durable: 2.6,
  helpful: 2.3,
  efficient: 2.8,
  friendly: 2.2,
  outstanding: 3.5,
  satisfying: 2.5,
  impressed: 2.7,
  fantastic: 3.3,
  flawless: 3.4,
  worth: 2.2,
  clean: 2.0,
  stunning: 3.2,
  brilliant: 3.3,
  solid: 2.0,
  responsive: 2.4
};

const NEGATIVE_LEXICON: Record<string, number> = {
  delay: -2.8,
  delayed: -2.8,
  poor: -3.2,
  expensive: -2.5,
  bad: -3.0,
  slow: -2.6,
  terrible: -3.5,
  broken: -3.3,
  worst: -3.8,
  useless: -3.4,
  defect: -3.2,
  defective: -3.2,
  waste: -3.1,
  issue: -2.2,
  issues: -2.2,
  problem: -2.2,
  problems: -2.2,
  refund: -2.5,
  crash: -3.0,
  disappointed: -3.2,
  disappointing: -3.2,
  hate: -3.4,
  frustrating: -3.0,
  horrible: -3.6,
  rough: -2.0,
  unresponsive: -2.8,
  complaint: -2.4,
  annoying: -2.5,
  glitch: -2.3,
  lag: -2.4,
  overpriced: -2.7,
  failed: -3.1,
  unusable: -3.5
};

const NEGATION_WORDS = new Set(['not', 'no', 'never', 'hardly', 'barely', 'scarcely', 'neither', 'nor', 'cannot', 'wasn\'t', 'isn\'t', 'aren\'t', 'don\'t', 'doesn\'t', 'didn\'t']);
const INTENSIFIERS: Record<string, number> = {
  very: 1.5,
  extremely: 2.0,
  incredibly: 1.8,
  super: 1.5,
  really: 1.4,
  quite: 1.2,
  completely: 1.6,
  absolutely: 1.8
};

/**
 * Executes the complete NLP pipeline on input text
 */
export async function runNLPPipelineFromBackend(rawText: string, model = 'logistic_regression'): Promise<NLPPipelineResult | null> {
  const backendResult = await analyzeTextWithBackend(rawText, model);

  if (!backendResult) {
    return null;
  }

  return {
    rawText: backendResult.rawText ?? backendResult.raw_text ?? rawText,
    cleanedText: backendResult.cleanedText ?? backendResult.cleaned_text ?? '',
    rawTokens: backendResult.rawTokens ?? backendResult.raw_tokens ?? [],
    lemmatizedTokens: backendResult.lemmatizedTokens ?? backendResult.lemmatized_tokens ?? backendResult.tokens ?? [],
    tokens: backendResult.tokens ?? [],
    removedStopwords: backendResult.removedStopwords ?? backendResult.removed_stopwords ?? [],
    positiveKeywordsFound: backendResult.positiveKeywordsFound ?? backendResult.positive_keywords_found ?? [],
    negativeKeywordsFound: backendResult.negativeKeywordsFound ?? backendResult.negative_keywords_found ?? [],
    polarityScore: Number(backendResult.polarityScore ?? backendResult.polarity_score ?? 0),
    normalizedScore: Number(backendResult.normalizedScore ?? backendResult.normalized_score ?? 0),
    sentiment: backendResult.sentiment ?? 'neutral',
    confidence: Number(backendResult.confidence ?? 0),
    modelDetails: backendResult.modelDetails,
    emotionBreakdown: {
      joy: Number(backendResult.emotionBreakdown?.joy ?? backendResult.emotion_breakdown?.joy ?? 0),
      trust: Number(backendResult.emotionBreakdown?.trust ?? backendResult.emotion_breakdown?.trust ?? 0),
      anticipation: Number(backendResult.emotionBreakdown?.anticipation ?? backendResult.emotion_breakdown?.anticipation ?? 0),
      frustration: Number(backendResult.emotionBreakdown?.frustration ?? backendResult.emotion_breakdown?.frustration ?? 0),
      disappointment: Number(backendResult.emotionBreakdown?.disappointment ?? backendResult.emotion_breakdown?.disappointment ?? 0),
    },
    processingTimeMs: Number(backendResult.processingTimeMs ?? backendResult.processing_time_ms ?? 0),
  };
}

export function runNLPPipeline(rawText: string): NLPPipelineResult {
  const startTime = performance.now();

  if (!rawText || rawText.trim().length === 0) {
    return {
      rawText: '',
      cleanedText: '',
      tokens: [],
      removedStopwords: [],
      positiveKeywordsFound: [],
      negativeKeywordsFound: [],
      polarityScore: 0,
      normalizedScore: 0.5,
      sentiment: 'neutral',
      confidence: 0,
      emotionBreakdown: { joy: 0, trust: 0, anticipation: 0, frustration: 0, disappointment: 0 },
      processingTimeMs: 0
    };
  }

  // Step 1: Preprocessing & Cleaning
  // Remove special characters, URLs, email addresses, excess whitespace, and lowercase
  const urlCleaned = rawText.replace(/https?:\/\/\S+|www\.\S+/gi, '');
  const punctuationCleaned = urlCleaned.replace(/[^\w\s']/gi, ' ').toLowerCase();
  const cleanedText = punctuationCleaned.replace(/\s+/g, ' ').trim();

  // Step 2: Tokenization
  const rawTokens = cleanedText.split(' ').filter(token => token.length > 0);

  // Step 3: Stopword Filtering & Token Analysis
  const tokens: string[] = [];
  const removedStopwords: string[] = [];

  for (const token of rawTokens) {
    // Preserve negations even if they are in stopwords for proper contextual analysis
    if (STOPWORDS.has(token) && !NEGATION_WORDS.has(token)) {
      removedStopwords.push(token);
    } else {
      tokens.push(token);
    }
  }

  // Step 4: Lexicon & Sentiment Representation
  const positiveFound: string[] = [];
  const negativeFound: string[] = [];
  let totalScore = 0;
  let wordScoreCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const prevWord = i > 0 ? tokens[i - 1] : '';
    const isNegated = NEGATION_WORDS.has(prevWord);
    const multiplier = INTENSIFIERS[prevWord] || 1;

    if (POSITIVE_LEXICON[word]) {
      let weight = POSITIVE_LEXICON[word] * multiplier;
      if (isNegated) {
        weight = -weight * 0.9;
        negativeFound.push(`not ${word}`);
      } else {
        positiveFound.push(word);
      }
      totalScore += weight;
      wordScoreCount++;
    } else if (NEGATIVE_LEXICON[word]) {
      let weight = NEGATIVE_LEXICON[word] * multiplier;
      if (isNegated) {
        weight = Math.abs(weight) * 0.7; // "not bad" is mildly positive
        positiveFound.push(`not ${word}`);
      } else {
        negativeFound.push(word);
      }
      totalScore += weight;
      wordScoreCount++;
    }
  }

  // Bounded Polarity Score (-1 to 1)
  let polarity = 0;
  if (wordScoreCount > 0) {
    polarity = totalScore / (wordScoreCount * 3.5);
    polarity = Math.max(-1, Math.min(1, polarity));
  }

  // Classification Thresholds
  let sentiment: SentimentType = 'neutral';
  if (polarity > 0.15) {
    sentiment = 'positive';
  } else if (polarity < -0.15) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // Normalized score: 0 to 1
  const normalizedScore = Number(((polarity + 1) / 2).toFixed(2));

  // Confidence calculation
  const keywordDensity = (positiveFound.length + negativeFound.length) / Math.max(tokens.length, 1);
  const confidence = Math.min(
    0.98,
    Math.max(0.65, Number((0.65 + Math.abs(polarity) * 0.25 + Math.min(keywordDensity * 0.3, 0.1)).toFixed(2)))
  );

  // Emotional Breakdown based on keyword profiles
  const joy = sentiment === 'positive' ? Math.round(50 + polarity * 45) : Math.round(Math.max(5, 20 + polarity * 15));
  const trust = sentiment === 'positive' ? Math.round(55 + polarity * 35) : Math.round(Math.max(10, 30 + polarity * 15));
  const anticipation = Math.round(30 + Math.random() * 20);
  const frustration = sentiment === 'negative' ? Math.round(60 + Math.abs(polarity) * 35) : Math.round(Math.max(4, 15 - polarity * 10));
  const disappointment = sentiment === 'negative' ? Math.round(55 + Math.abs(polarity) * 40) : Math.round(Math.max(2, 10 - polarity * 8));

  const endTime = performance.now();
  const processingTimeMs = Number((endTime - startTime).toFixed(1));

  return {
    rawText,
    cleanedText,
    tokens,
    removedStopwords,
    positiveKeywordsFound: Array.from(new Set(positiveFound)),
    negativeKeywordsFound: Array.from(new Set(negativeFound)),
    polarityScore: Number(polarity.toFixed(2)),
    normalizedScore,
    sentiment,
    confidence,
    emotionBreakdown: {
      joy,
      trust,
      anticipation,
      frustration,
      disappointment
    },
    processingTimeMs
  };
}
