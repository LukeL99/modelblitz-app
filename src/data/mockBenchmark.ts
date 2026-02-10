export interface ModelResult {
  rank: number;
  model: string;
  provider: string;
  accuracy: number;
  format: number;
  consistency: number;
  avgLatency: number;
  ttft: number;
  tokensPerSec: number;
  costPerQuery: number;
  composite: number;
}

export interface RunDetail {
  metric: string;
  run1: string;
  run2: string;
  run3: string;
  average: string;
  stdDev: string;
}

export const benchmarkConfig = {
  prompt: `Extract structured product data from the following product listing text. Return valid JSON matching this schema:
{
  "name": string,
  "brand": string,
  "price": number,
  "currency": string,
  "category": string,
  "features": string[],
  "availability": boolean
}`,
  exampleInput: `🔥 SALE! Sony WH-1000XM5 Wireless Noise Canceling Headphones - Silver
Premium sound meets premium comfort. Industry-leading noise cancellation with Auto NC Optimizer. 30-hour battery life. Multipoint connection for two devices. Speak-to-Chat auto-pause. Quick charging — 3 min charge = 3 hours playback.
Was $399.99, NOW $279.99! ✅ In Stock — Free 2-day shipping`,
  expectedOutput: `{
  "name": "WH-1000XM5 Wireless Noise Canceling Headphones",
  "brand": "Sony",
  "price": 279.99,
  "currency": "USD",
  "category": "Headphones",
  "features": [
    "Industry-leading noise cancellation",
    "Auto NC Optimizer",
    "30-hour battery life",
    "Multipoint connection",
    "Speak-to-Chat",
    "Quick charging"
  ],
  "availability": true
}`,
  outputType: 'JSON',
  weights: { accuracy: 9, speed: 2, cost: 6 },
  date: 'Feb 10, 2026',
  totalModels: 20,
  totalRuns: 60,
};

export const modelResults: ModelResult[] = [
  { rank: 1, model: 'Claude Sonnet 4.5', provider: 'Anthropic', accuracy: 96, format: 100, consistency: 98, avgLatency: 1.6, ttft: 0.3, tokensPerSec: 92, costPerQuery: 0.0045, composite: 94.2 },
  { rank: 2, model: 'GPT-4o', provider: 'OpenAI', accuracy: 95, format: 100, consistency: 96, avgLatency: 1.8, ttft: 0.4, tokensPerSec: 78, costPerQuery: 0.0075, composite: 89.1 },
  { rank: 3, model: 'Gemini 3 Pro', provider: 'Google', accuracy: 94, format: 98, consistency: 95, avgLatency: 1.2, ttft: 0.2, tokensPerSec: 105, costPerQuery: 0.0042, composite: 88.7 },
  { rank: 4, model: 'DeepSeek V3', provider: 'DeepSeek', accuracy: 92, format: 100, consistency: 95, avgLatency: 2.4, ttft: 0.6, tokensPerSec: 68, costPerQuery: 0.0014, composite: 87.3 },
  { rank: 5, model: 'Claude Haiku 4.5', provider: 'Anthropic', accuracy: 89, format: 98, consistency: 96, avgLatency: 0.5, ttft: 0.1, tokensPerSec: 155, costPerQuery: 0.0012, composite: 86.1 },
  { rank: 6, model: 'Mistral Large 2', provider: 'Mistral', accuracy: 90, format: 96, consistency: 91, avgLatency: 1.7, ttft: 0.4, tokensPerSec: 82, costPerQuery: 0.0036, composite: 84.5 },
  { rank: 7, model: 'GPT-4o Mini', provider: 'OpenAI', accuracy: 87, format: 98, consistency: 94, avgLatency: 0.7, ttft: 0.15, tokensPerSec: 128, costPerQuery: 0.0005, composite: 83.9 },
  { rank: 8, model: 'Qwen 3 72B', provider: 'Alibaba', accuracy: 90, format: 96, consistency: 92, avgLatency: 2.1, ttft: 0.5, tokensPerSec: 72, costPerQuery: 0.0016, composite: 82.1 },
  { rank: 9, model: 'Gemini 3 Flash', provider: 'Google', accuracy: 86, format: 96, consistency: 93, avgLatency: 0.4, ttft: 0.08, tokensPerSec: 175, costPerQuery: 0.0002, composite: 81.4 },
  { rank: 10, model: 'Llama 4 70B', provider: 'Meta', accuracy: 87, format: 94, consistency: 90, avgLatency: 1.5, ttft: 0.3, tokensPerSec: 90, costPerQuery: 0.001, composite: 80.2 },
  { rank: 11, model: 'Command R+', provider: 'Cohere', accuracy: 85, format: 94, consistency: 89, avgLatency: 2.0, ttft: 0.5, tokensPerSec: 75, costPerQuery: 0.0028, composite: 77.8 },
  { rank: 12, model: 'Claude Opus 4.6', provider: 'Anthropic', accuracy: 97, format: 100, consistency: 99, avgLatency: 3.8, ttft: 0.9, tokensPerSec: 48, costPerQuery: 0.0225, composite: 76.3 },
  { rank: 13, model: 'GPT-5.2', provider: 'OpenAI', accuracy: 98, format: 100, consistency: 99, avgLatency: 3.5, ttft: 0.8, tokensPerSec: 52, costPerQuery: 0.0300, composite: 74.1 },
  { rank: 14, model: 'Mistral Small', provider: 'Mistral', accuracy: 80, format: 92, consistency: 87, avgLatency: 0.6, ttft: 0.12, tokensPerSec: 140, costPerQuery: 0.0003, composite: 73.6 },
  { rank: 15, model: 'Llama 4 405B', provider: 'Meta', accuracy: 93, format: 98, consistency: 95, avgLatency: 3.2, ttft: 0.7, tokensPerSec: 55, costPerQuery: 0.0060, composite: 73.2 },
  { rank: 16, model: 'DeepSeek R1', provider: 'DeepSeek', accuracy: 91, format: 96, consistency: 87, avgLatency: 7.5, ttft: 1.8, tokensPerSec: 38, costPerQuery: 0.0055, composite: 68.9 },
  { rank: 17, model: 'Llama 4 8B', provider: 'Meta', accuracy: 73, format: 84, consistency: 85, avgLatency: 0.3, ttft: 0.06, tokensPerSec: 210, costPerQuery: 0.0001, composite: 65.4 },
  { rank: 18, model: 'Phi-4', provider: 'Microsoft', accuracy: 70, format: 80, consistency: 82, avgLatency: 0.6, ttft: 0.12, tokensPerSec: 125, costPerQuery: 0.0002, composite: 60.1 },
  { rank: 19, model: 'Nova Micro', provider: 'Amazon', accuracy: 74, format: 86, consistency: 83, avgLatency: 0.8, ttft: 0.15, tokensPerSec: 115, costPerQuery: 0.0003, composite: 59.8 },
  { rank: 20, model: 'Gemini 3 Flash 8B', provider: 'Google', accuracy: 75, format: 82, consistency: 80, avgLatency: 0.25, ttft: 0.05, tokensPerSec: 230, costPerQuery: 0.0001, composite: 57.2 },
];

export const topModelRunDetails: RunDetail[] = [
  { metric: 'Accuracy Score', run1: '95', run2: '97', run3: '96', average: '96', stdDev: '1.0' },
  { metric: 'Format Compliance', run1: '100', run2: '100', run3: '100', average: '100', stdDev: '0' },
  { metric: 'Total Latency', run1: '1.5s', run2: '1.7s', run3: '1.6s', average: '1.6s', stdDev: '0.1s' },
  { metric: 'TTFT', run1: '0.28s', run2: '0.32s', run3: '0.30s', average: '0.30s', stdDev: '0.02s' },
  { metric: 'Output Tokens', run1: '89', run2: '92', run3: '91', average: '91', stdDev: '1.5' },
  { metric: 'Cost', run1: '$0.0044', run2: '$0.0046', run3: '$0.0045', average: '$0.0045', stdDev: '—' },
];

export const allModels = [
  { name: 'Claude Opus 4.6', provider: 'Anthropic', tier: 'Premium', pricePerQuery: '$0.0225' },
  { name: 'GPT-5.2', provider: 'OpenAI', tier: 'Premium', pricePerQuery: '$0.0300' },
  { name: 'Llama 4 405B', provider: 'Meta', tier: 'Premium', pricePerQuery: '$0.0060' },
  { name: 'Claude Sonnet 4.5', provider: 'Anthropic', tier: 'Mid', pricePerQuery: '$0.0045' },
  { name: 'GPT-4o', provider: 'OpenAI', tier: 'Mid', pricePerQuery: '$0.0075' },
  { name: 'Gemini 3 Pro', provider: 'Google', tier: 'Mid', pricePerQuery: '$0.0042' },
  { name: 'Mistral Large 2', provider: 'Mistral', tier: 'Mid', pricePerQuery: '$0.0036' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'Mid', pricePerQuery: '$0.0014' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', tier: 'Mid', pricePerQuery: '$0.0055' },
  { name: 'Qwen 3 72B', provider: 'Alibaba', tier: 'Mid', pricePerQuery: '$0.0016' },
  { name: 'Llama 4 70B', provider: 'Meta', tier: 'Mid', pricePerQuery: '$0.0010' },
  { name: 'Command R+', provider: 'Cohere', tier: 'Mid', pricePerQuery: '$0.0028' },
  { name: 'Claude Haiku 4.5', provider: 'Anthropic', tier: 'Budget', pricePerQuery: '$0.0012' },
  { name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'Budget', pricePerQuery: '$0.0005' },
  { name: 'Gemini 3 Flash', provider: 'Google', tier: 'Budget', pricePerQuery: '$0.0002' },
  { name: 'Mistral Small', provider: 'Mistral', tier: 'Budget', pricePerQuery: '$0.0003' },
  { name: 'Llama 4 8B', provider: 'Meta', tier: 'Budget', pricePerQuery: '$0.0001' },
  { name: 'Gemini 3 Flash 8B', provider: 'Google', tier: 'Budget', pricePerQuery: '$0.0001' },
  { name: 'Phi-4', provider: 'Microsoft', tier: 'Budget', pricePerQuery: '$0.0002' },
  { name: 'Nova Micro', provider: 'Amazon', tier: 'Budget', pricePerQuery: '$0.0003' },
];

export const recommendationText = {
  title: 'Claude Sonnet 4.5',
  summary: 'For your JSON data extraction prompt, Claude Sonnet 4.5 delivers the best overall balance based on your priorities (accuracy-first, cost-conscious).',
  bullets: [
    '96/100 accuracy — Near-perfect extraction with correct types and values',
    '100% JSON compliance — Valid JSON every time, matches your schema exactly',
    '$0.0045/query — Less than half the cost of GPT-4o with comparable accuracy',
    '1.6s average latency — Fast enough for real-time use',
  ],
  savings: 'If you\'re currently using GPT-4o at 1,000 queries/day, switching to Claude Sonnet 4.5 saves you $90/month ($1,080/year).',
  honorable: [
    {
      title: 'Best Budget Option',
      model: 'GPT-4o Mini',
      description: '87/100 accuracy at just $0.0005/query. If accuracy above 85% is acceptable, this saves you 93% vs GPT-4o.',
    },
    {
      title: 'Fastest Option',
      model: 'Gemini 3 Flash',
      description: '0.4s total latency with 86/100 accuracy at $0.0002/query. If speed is critical and you can tolerate slightly lower accuracy.',
    },
    {
      title: 'Highest Accuracy',
      model: 'GPT-5.2 / Claude Opus 4.6',
      description: '98/100 and 97/100 accuracy but at $0.030 and $0.023/query respectively. Only worth it if you need the absolute best quality.',
    },
  ],
};
