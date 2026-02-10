export interface ModelData {
  rank: number;
  model: string;
  provider: string;
  tier: 'Premium' | 'Mid' | 'Budget';
  correct: number;
  p95: number;
  p99: number;
  ttft: number;
  median: number;
  spread: number;
  openRouterMedian: number;
  costPerRun: number;
}

export const MODELS: ModelData[] = [
  { rank: 1, model: 'Gemini 3 Flash Preview', provider: 'Google', tier: 'Mid', correct: 98, p95: 1.8, p99: 2.4, ttft: 0.3, median: 1.1, spread: 0.4, openRouterMedian: 1.2, costPerRun: 0.0008 },
  { rank: 2, model: 'Claude Sonnet 4.5', provider: 'Anthropic', tier: 'Mid', correct: 96, p95: 2.1, p99: 3.0, ttft: 0.4, median: 1.5, spread: 0.7, openRouterMedian: 2.8, costPerRun: 0.0052 },
  { rank: 3, model: 'GPT-5.2', provider: 'OpenAI', tier: 'Premium', correct: 96, p95: 2.5, p99: 3.8, ttft: 0.5, median: 1.8, spread: 0.9, openRouterMedian: 3.1, costPerRun: 0.0058 },
  { rank: 4, model: 'GPT-4o', provider: 'OpenAI', tier: 'Mid', correct: 94, p95: 1.9, p99: 2.6, ttft: 0.3, median: 1.3, spread: 0.5, openRouterMedian: 2.4, costPerRun: 0.0048 },
  { rank: 5, model: 'Gemini 3 Pro', provider: 'Google', tier: 'Premium', correct: 94, p95: 2.8, p99: 4.1, ttft: 0.6, median: 1.9, spread: 1.1, openRouterMedian: 2.0, costPerRun: 0.0041 },
  { rank: 6, model: 'Claude Opus 4.6', provider: 'Anthropic', tier: 'Premium', correct: 92, p95: 4.2, p99: 5.8, ttft: 0.8, median: 3.0, spread: 1.8, openRouterMedian: 3.5, costPerRun: 0.0180 },
  { rank: 7, model: 'Qwen2.5 VL 72B', provider: 'Qwen', tier: 'Mid', correct: 90, p95: 2.0, p99: 2.8, ttft: 0.4, median: 1.4, spread: 0.6, openRouterMedian: 1.6, costPerRun: 0.0005 },
  { rank: 8, model: 'GPT-5 Nano', provider: 'OpenAI', tier: 'Budget', correct: 88, p95: 0.9, p99: 1.2, ttft: 0.2, median: 0.6, spread: 0.3, openRouterMedian: 0.7, costPerRun: 0.0003 },
  { rank: 9, model: 'Llama 4 Scout', provider: 'Meta', tier: 'Budget', correct: 82, p95: 1.4, p99: 2.0, ttft: 0.3, median: 0.9, spread: 0.5, openRouterMedian: 1.1, costPerRun: 0.0004 },
  { rank: 10, model: 'Mistral Small 3.2', provider: 'Mistral', tier: 'Budget', correct: 82, p95: 1.6, p99: 2.2, ttft: 0.3, median: 1.0, spread: 0.6, openRouterMedian: 1.3, costPerRun: 0.0006 },
  { rank: 11, model: 'Seed 1.6 Flash', provider: 'ByteDance', tier: 'Budget', correct: 80, p95: 1.3, p99: 1.8, ttft: 0.3, median: 0.8, spread: 0.4, openRouterMedian: 1.0, costPerRun: 0.0004 },
  { rank: 12, model: 'Qwen3 VL 8B', provider: 'Qwen', tier: 'Budget', correct: 78, p95: 1.1, p99: 1.5, ttft: 0.2, median: 0.7, spread: 0.3, openRouterMedian: 0.9, costPerRun: 0.0003 },
  { rank: 13, model: 'Llama 4 Maverick', provider: 'Meta', tier: 'Mid', correct: 76, p95: 2.2, p99: 3.1, ttft: 0.5, median: 1.5, spread: 0.8, openRouterMedian: 1.7, costPerRun: 0.0006 },
  { rank: 14, model: 'InternVL3 78B', provider: 'OpenGVLab', tier: 'Mid', correct: 76, p95: 2.5, p99: 3.4, ttft: 0.5, median: 1.7, spread: 0.9, openRouterMedian: 2.0, costPerRun: 0.0005 },
  { rank: 15, model: 'Gemma 3 27B', provider: 'Google', tier: 'Budget', correct: 74, p95: 1.8, p99: 2.4, ttft: 0.3, median: 1.2, spread: 0.7, openRouterMedian: 1.4, costPerRun: 0.0002 },
  { rank: 16, model: 'Nova Lite', provider: 'Amazon', tier: 'Budget', correct: 72, p95: 1.5, p99: 2.1, ttft: 0.3, median: 1.0, spread: 0.5, openRouterMedian: 1.2, costPerRun: 0.0003 },
  { rank: 17, model: 'Pixtral 12B', provider: 'Mistral', tier: 'Budget', correct: 70, p95: 1.9, p99: 2.7, ttft: 0.4, median: 1.3, spread: 0.8, openRouterMedian: 1.5, costPerRun: 0.0001 },
  { rank: 18, model: 'Gemini 2.5 Flash Lite', provider: 'Google', tier: 'Budget', correct: 68, p95: 1.0, p99: 1.4, ttft: 0.2, median: 0.7, spread: 0.3, openRouterMedian: 0.8, costPerRun: 0.0002 },
  { rank: 19, model: 'Claude Haiku 4.5', provider: 'Anthropic', tier: 'Budget', correct: 64, p95: 0.8, p99: 1.1, ttft: 0.2, median: 0.5, spread: 0.3, openRouterMedian: 0.6, costPerRun: 0.0009 },
  { rank: 20, model: 'GPT-5 Image', provider: 'OpenAI', tier: 'Premium', correct: 58, p95: 3.5, p99: 4.8, ttft: 0.7, median: 2.5, spread: 1.5, openRouterMedian: 3.0, costPerRun: 0.0060 },
];

export const PROVIDER_COLORS: Record<string, string> = {
  Google: '#4285F4',
  Anthropic: '#D97706',
  OpenAI: '#10B981',
  Meta: '#3B82F6',
  Qwen: '#8B5CF6',
  Mistral: '#EC4899',
  ByteDance: '#06B6D4',
  OpenGVLab: '#F59E0B',
  Amazon: '#F97316',
};

export const TIER_COLORS: Record<string, string> = {
  Premium: '#F97316',
  Mid: '#3B82F6',
  Budget: '#22C55E',
};

export const EXPECTED_JSON = {
  merchant: "Trader Joe's",
  date: "2026-01-15",
  items: [
    { name: "Organic Bananas", qty: 1, price: 0.29 },
    { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
    { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
  ],
  subtotal: 7.76,
  tax: 0.62,
  total: 8.38,
  payment_method: "Visa *4821",
};

export interface ErrorExample {
  model: string;
  errors: Array<{
    field: string;
    expected: string;
    actual: string;
    errorType: string;
  }>;
  fullExpected: Record<string, unknown>;
  fullActual: Record<string, unknown>;
}

export const ERROR_EXAMPLES: ErrorExample[] = [
  {
    model: 'GPT-5 Nano',
    errors: [
      { field: 'tax', expected: '0.62', actual: '0.26', errorType: 'digit transposition' },
      { field: 'merchant', expected: "Trader Joe's", actual: 'Trader Joes', errorType: 'missing apostrophe' },
    ],
    fullExpected: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 7.76,
      tax: 0.62,
      total: 8.38,
      payment_method: "Visa *4821",
    },
    fullActual: {
      merchant: "Trader Joes",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 7.76,
      tax: 0.26,
      total: 8.38,
      payment_method: "Visa *4821",
    },
  },
  {
    model: 'Llama 4 Scout',
    errors: [
      { field: 'items', expected: '3 items', actual: '2 items (missed Cauliflower Gnocchi)', errorType: 'missing item' },
      { field: 'payment_method', expected: 'Visa *4821', actual: 'Mastercard *4821', errorType: 'wrong card type' },
    ],
    fullExpected: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 7.76,
      tax: 0.62,
      total: 8.38,
      payment_method: "Visa *4821",
    },
    fullActual: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
      ],
      subtotal: 4.27,
      tax: 0.62,
      total: 4.89,
      payment_method: "Mastercard *4821",
    },
  },
  {
    model: 'Pixtral 12B',
    errors: [
      { field: 'date', expected: '2026-01-15', actual: '01/15/2026', errorType: 'wrong date format' },
      { field: 'items[*].qty', expected: 'varies (1, 2, 1)', actual: 'all 1', errorType: 'quantities defaulted to 1' },
    ],
    fullExpected: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 7.76,
      tax: 0.62,
      total: 8.38,
      payment_method: "Visa *4821",
    },
    fullActual: {
      merchant: "Trader Joe's",
      date: "01/15/2026",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 1, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 5.77,
      tax: 0.62,
      total: 6.39,
      payment_method: "Visa *4821",
    },
  },
  {
    model: 'Claude Haiku 4.5',
    errors: [
      { field: 'subtotal', expected: '7.76', actual: '7.77', errorType: 'rounding error' },
      { field: 'items', expected: '3 items', actual: '4 items (phantom "Bag Fee")', errorType: 'hallucinated item' },
    ],
    fullExpected: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
      ],
      subtotal: 7.76,
      tax: 0.62,
      total: 8.38,
      payment_method: "Visa *4821",
    },
    fullActual: {
      merchant: "Trader Joe's",
      date: "2026-01-15",
      items: [
        { name: "Organic Bananas", qty: 1, price: 0.29 },
        { name: "Everything Bagel Seasoning", qty: 2, price: 1.99 },
        { name: "Cauliflower Gnocchi", qty: 1, price: 3.49 },
        { name: "Bag Fee", qty: 1, price: 0.10 },
      ],
      subtotal: 7.77,
      tax: 0.62,
      total: 8.49,
      payment_method: "Visa *4821",
    },
  },
];

// Generate mock run data for each model
export function generateRunData(model: ModelData, runsPerModel: number = 50): Array<{
  run: number;
  correct: boolean;
  responseTime: number;
  tokens: number;
}> {
  const correctCount = Math.round((model.correct / 100) * runsPerModel);
  const runs = [];
  
  for (let i = 0; i < runsPerModel; i++) {
    const isCorrect = i < correctCount;
    const baseTime = model.p95 * 0.8;
    const jitter = (Math.sin(i * 7.3 + model.rank * 2.1) * 0.5 + 0.5) * model.p95 * 0.4;
    const responseTime = parseFloat((baseTime + jitter).toFixed(2));
    const tokens = Math.floor(180 + (Math.sin(i * 3.7 + model.rank) * 0.5 + 0.5) * 120);
    
    runs.push({
      run: i + 1,
      correct: isCorrect,
      responseTime,
      tokens,
    });
  }
  
  // Shuffle so incorrect ones aren't all at the end
  for (let i = runs.length - 1; i > 0; i--) {
    const seed = Math.sin(i * 13.7 + model.rank * 5.3) * 0.5 + 0.5;
    const j = Math.floor(seed * (i + 1));
    [runs[i], runs[j]] = [runs[j], runs[i]];
  }
  
  return runs;
}
