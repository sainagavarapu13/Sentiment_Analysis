import { CategoryMetric, KeywordMetric, MonthlyTrend, ReviewItem, SentimentMetric, TeamMember } from '../types/sentiment';

export const INITIAL_METRICS: SentimentMetric = {
  totalReviews: 5000,
  positiveReviews: 3150,
  positivePercentage: 63,
  neutralReviews: 950,
  neutralPercentage: 19,
  negativeReviews: 900,
  negativePercentage: 18,
  overallSentiment: 'positive',
  averageSentimentScore: 0.72,
  topReviewedProduct: 'Product A',
  topProductReviewCount: 1840,
  topProductSentimentScore: 0.78,
};

// Monthly trends from January to June showing positive reviews increasing as noted in abstract
export const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'January', positive: 420, neutral: 180, negative: 200, total: 800, averageScore: 0.64 },
  { month: 'February', positive: 460, neutral: 170, negative: 180, total: 810, averageScore: 0.67 },
  { month: 'March', positive: 510, neutral: 160, negative: 160, total: 830, averageScore: 0.70 },
  { month: 'April', positive: 550, neutral: 150, negative: 140, total: 840, averageScore: 0.73 },
  { month: 'May', positive: 590, neutral: 145, negative: 115, total: 850, averageScore: 0.76 },
  { month: 'June', positive: 620, neutral: 145, negative: 105, total: 870, averageScore: 0.79 },
];

// Product & Category comparison
export const CATEGORY_METRICS: CategoryMetric[] = [
  { category: 'Product A', total: 1840, positive: 1250, neutral: 330, negative: 260, averageScore: 0.78 },
  { category: 'Product B', total: 1210, positive: 740, neutral: 250, negative: 220, averageScore: 0.71 },
  { category: 'Product C', total: 850, positive: 510, neutral: 180, negative: 160, averageScore: 0.69 },
  { category: 'Product D', total: 620, positive: 360, neutral: 110, negative: 150, averageScore: 0.66 },
  { category: 'Movie Reviews', total: 280, positive: 180, neutral: 50, negative: 50, averageScore: 0.73 },
  { category: 'Social Comments', total: 200, positive: 110, neutral: 30, negative: 60, averageScore: 0.64 },
];

// Frequently occurring keywords as specified in the abstract:
// Positive: Excellent, Good, Fast, Quality, Easy
// Negative: Delay, Poor, Expensive, Bad, Slow
export const KEYWORD_METRICS: KeywordMetric[] = [
  { word: 'Excellent', count: 1420, type: 'positive', score: 0.92 },
  { word: 'Good', count: 1350, type: 'positive', score: 0.75 },
  { word: 'Fast', count: 980, type: 'positive', score: 0.81 },
  { word: 'Quality', count: 890, type: 'positive', score: 0.85 },
  { word: 'Easy', count: 760, type: 'positive', score: 0.79 },
  { word: 'Great', count: 680, type: 'positive', score: 0.84 },
  { word: 'Loved', count: 540, type: 'positive', score: 0.88 },
  { word: 'Reliable', count: 430, type: 'positive', score: 0.82 },
  
  { word: 'Delay', count: 620, type: 'negative', score: -0.76 },
  { word: 'Poor', count: 580, type: 'negative', score: -0.85 },
  { word: 'Expensive', count: 510, type: 'negative', score: -0.68 },
  { word: 'Bad', count: 480, type: 'negative', score: -0.82 },
  { word: 'Slow', count: 420, type: 'negative', score: -0.74 },
  { word: 'Broken', count: 290, type: 'negative', score: -0.89 },
  { word: 'Refund', count: 240, type: 'negative', score: -0.71 },
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'REV-5001',
    source: 'Product Review',
    target: 'Product A',
    author: 'Elena Rostova',
    date: '2026-06-18',
    rating: 5,
    text: 'The build quality is excellent and setup was remarkably fast and easy. Highly recommended for daily use!',
    sentiment: 'positive',
    score: 0.92,
    confidence: 0.96,
    matchedKeywords: ['quality', 'excellent', 'fast', 'easy']
  },
  {
    id: 'REV-5002',
    source: 'Customer Feedback',
    target: 'Product B',
    author: 'Marcus Vance',
    date: '2026-06-16',
    rating: 1,
    text: 'Experiencing huge delay in shipment. Very poor response time from support team and overall slow service.',
    sentiment: 'negative',
    score: -0.84,
    confidence: 0.94,
    matchedKeywords: ['delay', 'poor', 'slow']
  },
  {
    id: 'REV-5003',
    source: 'Product Review',
    target: 'Product A',
    author: 'Sophia Chen',
    date: '2026-06-15',
    rating: 5,
    text: 'Good performance so far. Really impressed by the fast battery recharge and premium quality materials.',
    sentiment: 'positive',
    score: 0.86,
    confidence: 0.91,
    matchedKeywords: ['good', 'fast', 'quality']
  },
  {
    id: 'REV-5004',
    source: 'Movie Review',
    target: 'Sci-Fi Odyssey',
    author: 'David K.',
    date: '2026-06-12',
    rating: 3,
    text: 'Average cinematic pacing. The visual effects were decent, but the storyline felt standard and neutral.',
    sentiment: 'neutral',
    score: 0.05,
    confidence: 0.74,
    matchedKeywords: []
  },
  {
    id: 'REV-5005',
    source: 'Social Media',
    target: 'Product C',
    author: 'Aria Taylor',
    date: '2026-06-10',
    rating: 2,
    text: 'Way too expensive for what it delivers. Bad battery longevity and poor hardware casing.',
    sentiment: 'negative',
    score: -0.78,
    confidence: 0.93,
    matchedKeywords: ['expensive', 'bad', 'poor']
  },
  {
    id: 'REV-5006',
    source: 'Product Review',
    target: 'Product A',
    author: 'Liam Miller',
    date: '2026-06-08',
    rating: 5,
    text: 'Seamless software integration. Everything works with excellent precision and it is super easy to customize.',
    sentiment: 'positive',
    score: 0.89,
    confidence: 0.95,
    matchedKeywords: ['excellent', 'easy']
  },
  {
    id: 'REV-5007',
    source: 'Customer Feedback',
    target: 'Product D',
    author: 'Grace Hopper',
    date: '2026-06-05',
    rating: 3,
    text: 'The product functions as stated in the manual. Delivery arrived on schedule without surprises.',
    sentiment: 'neutral',
    score: 0.08,
    confidence: 0.78,
    matchedKeywords: []
  },
  {
    id: 'REV-5008',
    source: 'Social Media',
    target: 'Product B',
    author: 'Kenji Sato',
    date: '2026-06-02',
    rating: 1,
    text: 'Dispatched with broken seals. Slow customer support response and refused instant refund.',
    sentiment: 'negative',
    score: -0.85,
    confidence: 0.96,
    matchedKeywords: ['broken', 'slow', 'refund']
  },
  {
    id: 'REV-5009',
    source: 'Product Review',
    target: 'Product A',
    author: 'Priya Sharma',
    date: '2026-05-29',
    rating: 5,
    text: 'Top quality product! Super easy navigation and very fast processing speed.',
    sentiment: 'positive',
    score: 0.91,
    confidence: 0.97,
    matchedKeywords: ['quality', 'easy', 'fast']
  },
  {
    id: 'REV-5010',
    source: 'Movie Review',
    target: 'Midnight Echoes',
    author: 'Oliver Twist',
    date: '2026-05-25',
    rating: 4,
    text: 'An excellent script and good acting performance by the entire lead ensemble.',
    sentiment: 'positive',
    score: 0.82,
    confidence: 0.90,
    matchedKeywords: ['excellent', 'good']
  },
  {
    id: 'REV-5011',
    source: 'Customer Feedback',
    target: 'Product C',
    author: 'Hannah Abbott',
    date: '2026-05-21',
    rating: 2,
    text: 'The user interface feels slow and laggy. Too expensive compared to competitive market alternatives.',
    sentiment: 'negative',
    score: -0.72,
    confidence: 0.89,
    matchedKeywords: ['slow', 'expensive']
  },
  {
    id: 'REV-5012',
    source: 'Social Media',
    target: 'Product A',
    author: 'Lucas Meyer',
    date: '2026-05-18',
    rating: 4,
    text: 'Good ergonomic grip and solid quality. Has been fast and dependable for 3 months.',
    sentiment: 'positive',
    score: 0.79,
    confidence: 0.88,
    matchedKeywords: ['good', 'quality', 'fast']
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'B. SHANMUKHI SRI', rollNo: '24B11CS052', role: 'NLP Preprocessing & Feature Engineering' },
  { name: 'M. SRI HARINI', rollNo: '24B11CS264', role: 'Sentiment Classification & Algorithm Modeling' },
  { name: 'N. SAI SRAVYA', rollNo: '24B11CS303', role: 'Data Visualization & Interactive Dashboard' },
  { name: 'T.V.R. INDU BHARGAVI', rollNo: '24B11CS439', role: 'Data Collection & System Integration' },
];

export const PROJECT_ABSTRACT = `The Sentiment Analysis System is an NLP-based project designed to analyze and understand opinions, emotions, and feedback expressed through textual data. The system can process data obtained from various sources, including product reviews, movie reviews, customer feedback, and social media comments. Its main purpose is to automatically identify the sentiment of the given text and categorize it into Positive, Negative, or Neutral classes.

The project follows a systematic process that begins with collecting a suitable text dataset. The collected data is then preprocessed by removing unnecessary characters, common words, and other unwanted elements to improve the quality of the text. After preprocessing, the text data is converted into a suitable representation for sentiment analysis, allowing the system to determine the sentiment associated with each review or comment.

To make the analyzed information easier to understand, the results are presented through statistical summaries and interactive visualizations. The proposed system provides a Sentiment Analysis Dashboard containing important insights such as the total number of reviews analyzed, distribution of positive, negative, and neutral sentiments, frequently used words, sentiment trends, and category-wise sentiment analysis.

The developed system helps users quickly understand overall public opinion and identify important sentiment patterns, thereby supporting effective and data-driven decision making. Furthermore, the project provides practical experience in the complete NLP pipeline, including data collection, text preprocessing, sentiment classification, data visualization, result interpretation, and dashboard development.`;
