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

interface CostDataPoint {
  modelName: string;
  costPerRun: number;
  provider: string;
}

interface CostChartProps {
  data: CostDataPoint[];
}

function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.0001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(4)}`;
}

export function CostChart({ data }: CostChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-muted text-sm">No cost data available.</p>
    );
  }

  // Sort by costPerRun ascending (cheapest at top)
  const sorted = [...data].sort((a, b) => a.costPerRun - b.costPerRun);

  const barHeight = 24;
  const barGap = 12;
  const labelWidth = 160;
  const valueWidth = 90;
  const width = 600;
  const paddingTop = 30;
  const paddingBottom = 30;
  const paddingRight = 20;
  const chartLeft = labelWidth;
  const chartWidth = width - chartLeft - valueWidth - paddingRight;
  const height = Math.max(200, sorted.length * (barHeight + barGap) + paddingTop + paddingBottom);

  // Only consider non-zero costs for max
  const nonZeroCosts = sorted.filter((d) => d.costPerRun > 0);
  const maxCost = nonZeroCosts.length > 0
    ? Math.max(...nonZeroCosts.map((d) => d.costPerRun))
    : 1;

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
        Cost per Run ($)
      </text>

      {/* Bars */}
      {sorted.map((d, i) => {
        const y = paddingTop + i * (barHeight + barGap);
        const color = getProviderColor(d.provider);
        const isFree = d.costPerRun === 0;
        const barWidth = isFree
          ? 0
          : Math.max(2, (d.costPerRun / maxCost) * chartWidth);

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

            {isFree ? (
              /* FREE badge */
              <>
                <rect
                  x={chartLeft}
                  y={y + 2}
                  width={44}
                  height={barHeight - 4}
                  fill="#10B981"
                  fillOpacity={0.15}
                  rx={4}
                />
                <text
                  x={chartLeft + 22}
                  y={y + barHeight / 2 + 4}
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize={10}
                  fontWeight={700}
                >
                  FREE
                </text>
              </>
            ) : (
              /* Bar */
              <>
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
                    {"\n"}Cost: {formatCost(d.costPerRun)}
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
                  {formatCost(d.costPerRun)}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
