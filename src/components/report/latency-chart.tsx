"use client";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10A37F",
  anthropic: "#D4A574",
  google: "#4285F4",
  "meta-llama": "#0668E1",
  qwen: "#6366F1",
  mistralai: "#FF7000",
  "x-ai": "#FFFFFF",
  nvidia: "#76B900",
};

function getProviderColor(provider: string): string {
  return PROVIDER_COLORS[provider] ?? "#6B7280";
}

interface LatencyDataPoint {
  modelName: string;
  p95: number;
  provider: string;
}

interface LatencyChartProps {
  data: LatencyDataPoint[];
}

export function LatencyChart({ data }: LatencyChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-muted text-sm">No latency data available.</p>
    );
  }

  // Sort by p95 ascending (fastest at top)
  const sorted = [...data].sort((a, b) => a.p95 - b.p95);

  const barHeight = 24;
  const barGap = 12;
  const labelWidth = 160;
  const valueWidth = 70;
  const width = 600;
  const paddingTop = 30;
  const paddingBottom = 30;
  const paddingRight = 20;
  const chartLeft = labelWidth;
  const chartWidth = width - chartLeft - valueWidth - paddingRight;
  const height = Math.max(200, sorted.length * (barHeight + barGap) + paddingTop + paddingBottom);

  const maxP95 = Math.max(...sorted.map((d) => d.p95), 1);

  // X-axis ticks
  const tickCount = 4;
  const xTicks = Array.from(
    { length: tickCount },
    (_, i) => Math.round((maxP95 / tickCount) * (i + 1))
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* X-axis label */}
      <text
        x={chartLeft + chartWidth / 2}
        y={height - 6}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={11}
      >
        P95 Latency (ms)
      </text>

      {/* X-axis ticks */}
      {xTicks.map((tick) => {
        const x = chartLeft + (tick / maxP95) * chartWidth;
        return (
          <g key={`tick-${tick}`}>
            <line
              x1={x}
              y1={paddingTop - 5}
              x2={x}
              y2={height - paddingBottom}
              stroke="#333"
              strokeDasharray="4 4"
              strokeWidth={0.5}
            />
            <text
              x={x}
              y={paddingTop - 10}
              textAnchor="middle"
              fill="#6B7280"
              fontSize={9}
            >
              {tick}ms
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {sorted.map((d, i) => {
        const y = paddingTop + i * (barHeight + barGap);
        const barWidth = Math.max(2, (d.p95 / maxP95) * chartWidth);
        const color = getProviderColor(d.provider);

        return (
          <g key={d.modelName}>
            {/* Model name label */}
            <text
              x={labelWidth - 8}
              y={y + barHeight / 2 + 4}
              textAnchor="end"
              fill="#9CA3AF"
              fontSize={11}
            >
              {d.modelName.length > 22
                ? d.modelName.slice(0, 20) + "..."
                : d.modelName}
            </text>

            {/* Bar */}
            <rect
              x={chartLeft}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
              fillOpacity={0.85}
            >
              <title>
                {d.modelName}
                {"\n"}P95 Latency: {d.p95}ms
              </title>
            </rect>

            {/* Value label */}
            <text
              x={chartLeft + barWidth + 6}
              y={y + barHeight / 2 + 4}
              textAnchor="start"
              fill="#D1D5DB"
              fontSize={10}
              fontWeight={600}
            >
              {d.p95}ms
            </text>
          </g>
        );
      })}
    </svg>
  );
}
