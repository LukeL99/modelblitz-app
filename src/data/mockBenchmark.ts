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
  { rank: 1, model: 'Claude 3.5 Sonnet', provider: 'Anthropic', accuracy: 96, format: 100, consistency: 98, avgLatency: 1.8, ttft: 0.4, tokensPerSec: 82, costPerQuery: 0.0045, composite: 94.2 },
  { rank: 2, model: 'GPT-4o', provider: 'OpenAI', accuracy: 97, format: 100, consistency: 96, avgLatency: 2.1, ttft: 0.5, tokensPerSec: 71, costPerQuery: 0.0089, composite: 89.1 },
  { rank: 3, model: 'Gemini 2.0 Pro', provider: 'Google', accuracy: 93, format: 98, consistency: 94, avgLatency: 1.4, ttft: 0.3, tokensPerSec: 95, costPerQuery: 0.0038, composite: 88.7 },
  { rank: 4, model: 'DeepSeek V3', provider: 'DeepSeek', accuracy: 92, format: 100, consistency: 95, avgLatency: 2.8, ttft: 0.8, tokensPerSec: 63, costPerQuery: 0.0014, composite: 87.3 },
  { rank: 5, model: 'Claude 3.5 Haiku', provider: 'Anthropic', accuracy: 88, format: 98, consistency: 96, avgLatency: 0.6, ttft: 0.1, tokensPerSec: 145, costPerQuery: 0.0008, composite: 86.1 },
  { rank: 6, model: 'Mistral Large', provider: 'Mistral', accuracy: 90, format: 96, consistency: 91, avgLatency: 1.9, ttft: 0.5, tokensPerSec: 78, costPerQuery: 0.0036, composite: 84.5 },
  { rank: 7, model: 'GPT-4o-mini', provider: 'OpenAI', accuracy: 87, format: 98, consistency: 94, avgLatency: 0.9, ttft: 0.2, tokensPerSec: 118, costPerQuery: 0.0006, composite: 83.9 },
  { rank: 8, model: 'Qwen 2.5 72B', provider: 'Alibaba', accuracy: 89, format: 94, consistency: 90, avgLatency: 2.4, ttft: 0.6, tokensPerSec: 67, costPerQuery: 0.0018, composite: 82.1 },
  { rank: 9, model: 'Gemini 2.0 Flash', provider: 'Google', accuracy: 84, format: 96, consistency: 92, avgLatency: 0.5, ttft: 0.1, tokensPerSec: 162, costPerQuery: 0.0003, composite: 81.4 },
  { rank: 10, model: 'Llama 3.3 70B', provider: 'Meta', accuracy: 86, format: 92, consistency: 88, avgLatency: 1.7, ttft: 0.4, tokensPerSec: 85, costPerQuery: 0.0012, composite: 80.2 },
  { rank: 11, model: 'Command R+', provider: 'Cohere', accuracy: 85, format: 94, consistency: 89, avgLatency: 2.2, ttft: 0.6, tokensPerSec: 72, costPerQuery: 0.003, composite: 77.8 },
  { rank: 12, model: 'Claude 3 Opus', provider: 'Anthropic', accuracy: 95, format: 100, consistency: 97, avgLatency: 4.2, ttft: 1.1, tokensPerSec: 42, costPerQuery: 0.0225, composite: 76.3 },
  { rank: 13, model: 'GPT-4.5', provider: 'OpenAI', accuracy: 97, format: 100, consistency: 98, avgLatency: 3.8, ttft: 0.9, tokensPerSec: 48, costPerQuery: 0.032, composite: 74.1 },
  { rank: 14, model: 'Mistral Small', provider: 'Mistral', accuracy: 79, format: 90, consistency: 86, avgLatency: 0.7, ttft: 0.2, tokensPerSec: 132, costPerQuery: 0.0004, composite: 73.6 },
  { rank: 15, model: 'Gemini 2.0 Ultra', provider: 'Google', accuracy: 94, format: 98, consistency: 95, avgLatency: 3.5, ttft: 0.8, tokensPerSec: 51, costPerQuery: 0.018, composite: 73.2 },
  { rank: 16, model: 'DeepSeek R1', provider: 'DeepSeek', accuracy: 91, format: 96, consistency: 87, avgLatency: 8.2, ttft: 2.1, tokensPerSec: 34, costPerQuery: 0.0055, composite: 68.9 },
  { rank: 17, model: 'Llama 3.3 8B', provider: 'Meta', accuracy: 71, format: 82, consistency: 84, avgLatency: 0.4, ttft: 0.1, tokensPerSec: 195, costPerQuery: 0.0002, composite: 65.4 },
  { rank: 18, model: 'Phi-3 Medium', provider: 'Microsoft', accuracy: 68, format: 78, consistency: 80, avgLatency: 0.8, ttft: 0.2, tokensPerSec: 110, costPerQuery: 0.0003, composite: 60.1 },
  { rank: 19, model: 'Mixtral 8x22B', provider: 'Mistral', accuracy: 76, format: 86, consistency: 82, avgLatency: 2.9, ttft: 0.7, tokensPerSec: 58, costPerQuery: 0.0022, composite: 59.8 },
  { rank: 20, model: 'Gemma 2 27B', provider: 'Google', accuracy: 72, format: 80, consistency: 78, avgLatency: 1.2, ttft: 0.3, tokensPerSec: 91, costPerQuery: 0.0005, composite: 57.2 },
];

export const topModelRunDetails: RunDetail[] = [
  { metric: 'Accuracy Score', run1: '95', run2: '97', run3: '96', average: '96', stdDev: '1.0' },
  { metric: 'Format Compliance', run1: '100', run2: '100', run3: '100', average: '100', stdDev: '0' },
  { metric: 'Total Latency', run1: '1.7s', run2: '1.9s', run3: '1.8s', average: '1.8s', stdDev: '0.1s' },
  { metric: 'TTFT', run1: '0.38s', run2: '0.42s', run3: '0.39s', average: '0.40s', stdDev: '0.02s' },
  { metric: 'Output Tokens', run1: '89', run2: '92', run3: '91', average: '91', stdDev: '1.5' },
  { metric: 'Cost', run1: '$0.0044', run2: '$0.0046', run3: '$0.0045', average: '$0.0045', stdDev: '—' },
];

export const allModels = [
  { name: 'GPT-4.5', provider: 'OpenAI', tier: 'Premium', pricePerQuery: '$0.032' },
  { name: 'GPT-4o', provider: 'OpenAI', tier: 'Mid', pricePerQuery: '$0.0089' },
  { name: 'GPT-4o-mini', provider: 'OpenAI', tier: 'Budget', pricePerQuery: '$0.0006' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', tier: 'Premium', pricePerQuery: '$0.0225' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'Mid', pricePerQuery: '$0.0045' },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic', tier: 'Budget', pricePerQuery: '$0.0008' },
  { name: 'Gemini 2.0 Ultra', provider: 'Google', tier: 'Premium', pricePerQuery: '$0.018' },
  { name: 'Gemini 2.0 Pro', provider: 'Google', tier: 'Mid', pricePerQuery: '$0.0038' },
  { name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'Budget', pricePerQuery: '$0.0003' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', tier: 'Mid', pricePerQuery: '$0.0055' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'Budget', pricePerQuery: '$0.0014' },
  { name: 'Mistral Large', provider: 'Mistral', tier: 'Mid', pricePerQuery: '$0.0036' },
  { name: 'Mistral Small', provider: 'Mistral', tier: 'Budget', pricePerQuery: '$0.0004' },
  { name: 'Llama 3.3 70B', provider: 'Meta', tier: 'Mid', pricePerQuery: '$0.0012' },
  { name: 'Llama 3.3 8B', provider: 'Meta', tier: 'Budget', pricePerQuery: '$0.0002' },
  { name: 'Command R+', provider: 'Cohere', tier: 'Mid', pricePerQuery: '$0.003' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', tier: 'Mid', pricePerQuery: '$0.0018' },
  { name: 'Mixtral 8x22B', provider: 'Mistral', tier: 'Mid', pricePerQuery: '$0.0022' },
  { name: 'Gemma 2 27B', provider: 'Google', tier: 'Budget', pricePerQuery: '$0.0005' },
  { name: 'Phi-3 Medium', provider: 'Microsoft', tier: 'Budget', pricePerQuery: '$0.0003' },
];

export const recommendationText = {
  title: 'Claude 3.5 Sonnet',
  summary: 'For your JSON data extraction prompt, Claude 3.5 Sonnet delivers the best overall balance based on your priorities (accuracy-first, cost-conscious).',
  bullets: [
    '96/100 accuracy — Near-perfect extraction with correct types and values',
    '100% JSON compliance — Valid JSON every time, matches your schema exactly',
    '$0.0045/query — Half the cost of GPT-4o with comparable accuracy',
    '1.8s average latency — Fast enough for real-time use',
  ],
  savings: 'If you\'re currently using GPT-4o at 1,000 queries/day, switching to Claude 3.5 Sonnet saves you $132/month ($1,584/year).',
  honorable: [
    {
      title: 'Best Budget Option',
      model: 'GPT-4o-mini',
      description: '87/100 accuracy at just $0.0006/query. If accuracy above 85% is acceptable, this saves you 93% vs GPT-4o.',
    },
    {
      title: 'Fastest Option',
      model: 'Gemini 2.0 Flash',
      description: '0.5s total latency with 84/100 accuracy at $0.0003/query. If speed is critical and you can tolerate slightly lower accuracy.',
    },
    {
      title: 'Highest Accuracy',
      model: 'GPT-4.5 / GPT-4o',
      description: '97/100 accuracy but at $0.032 and $0.009/query respectively. Only worth it if you need the absolute best quality.',
    },
  ],
};
